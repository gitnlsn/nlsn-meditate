import AVFoundation
import Foundation
import OSLog

/// Filter for these with: xcrun simctl spawn <device> log stream --predicate
/// 'subsystem == "expo.modules.meditationsession"'
let log = Logger(subsystem: "expo.modules.meditationsession", category: "session")

struct TimelineItem {
  let kind: String
  let uri: String?
  let durationMs: Double
  let cueIndex: Int
}

struct SessionSpec {
  let sessionId: String
  let durationSeconds: Double
  let items: [TimelineItem]
  let voiceVolume: Float
  let bedUri: String?
  let bedVolume: Float
  let meditationId: String?
  let title: String?
}

/**
 The meditation, running.

 iOS has no equivalent of a background service, and it is worth being plain about
 that: the only background execution Apple grants here is the process staying
 unsuspended *while audio is actually playing*. So the "service" has to be the
 audio itself — one continuous item that runs from the first breath to the last.

 Which is why a session is built as a single `AVMutableComposition`: every spoken
 clip inserted in turn, and every silence between them inserted as a genuinely
 empty stretch of the timeline rather than a pause someone has to be awake to
 time. Nothing on disk changes and nothing is merged ahead of time — the
 composition is assembled in memory, from the same separate files, each time a
 session starts.
 */
final class MeditationSession {
  private var player: AVPlayer?
  private var bed: AVQueuePlayer?
  private var looper: AVPlayerLooper?
  private var spec: SessionSpec?

  /// Where each item begins, so a position in the composition can be named.
  private var startOffsets: [Double] = []
  private var timeObserver: Any?
  private var endObserver: NSObjectProtocol?

  private var currentIndex = -1
  private var finished = false
  private var progressEnabled = true

  var onItemChanged: ((Int, Int) -> Void)?
  var onStateChanged: ((String) -> Void)?
  var onProgress: ((Double) -> Void)?
  var onCompleted: ((String, Double) -> Void)?
  var onError: ((String) -> Void)?

  var isRunning: Bool { player != nil }

  // MARK: - controls

  func start(_ next: SessionSpec) async {
    stop(notify: false)
    spec = next
    finished = false
    currentIndex = -1

    log.info("start session=\(next.sessionId, privacy: .public) items=\(next.items.count) duration=\(next.durationSeconds)s")

    do {
      try activateSession()
      let (composition, offsets) = try await buildComposition(next.items)
      startOffsets = offsets
      log.debug("composition built, \(composition.duration.seconds)s long")

      let item = AVPlayerItem(asset: composition)
      let voice = AVPlayer(playerItem: item)
      voice.volume = next.voiceVolume
      // Nothing here is streamed, so waiting to minimise stalling only delays
      // the first line.
      voice.automaticallyWaitsToMinimizeStalling = false
      player = voice

      observe(item: item)
      startBed(next)

      voice.play()
      onStateChanged?("running")
      report(position: 0)
    } catch {
      log.error("could not build the session: \(error.localizedDescription, privacy: .public)")
      onError?("could not build the session: \(error.localizedDescription)")
      stop(notify: true)
    }
  }

  func pause() {
    log.info("pause at \(self.positionSeconds())s")
    player?.pause()
    bed?.pause()
    onStateChanged?("paused")
  }

  func resume() {
    log.info("resume at \(self.positionSeconds())s")
    do { try activateSession() } catch {
      onError?("could not resume: \(error.localizedDescription)")
    }
    player?.play()
    bed?.play()
    onStateChanged?("running")
  }

  func stop(notify: Bool = true) {
    let had = spec != nil
    teardown()
    if had && notify { onStateChanged?("idle") }
  }

  func setProgressUpdates(_ enabled: Bool) {
    progressEnabled = enabled
  }

  /**
   What is playing right now, for a screen that has just appeared.

   The session outlives the app that started it, so a rebuilt JavaScript runtime
   comes back knowing nothing while the meditation carries on underneath.
   */
  func snapshot() -> [String: Any]? {
    guard let spec, let player else { return nil }
    var out: [String: Any] = [
      "sessionId": spec.sessionId,
      "state": player.timeControlStatus == .paused ? "paused" : "running",
      "positionMs": positionSeconds() * 1000,
      "index": max(currentIndex, 0),
      "cueIndex": spec.items.indices.contains(currentIndex) ? spec.items[currentIndex].cueIndex : -1,
      "durationSeconds": spec.durationSeconds,
    ]
    if let id = spec.meditationId { out["meditationId"] = id }
    if let title = spec.title { out["title"] = title }
    return out
  }

  // MARK: - building

  private func buildComposition(_ items: [TimelineItem]) async throws -> (AVMutableComposition, [Double]) {
    let composition = AVMutableComposition()
    guard let track = composition.addMutableTrack(
      withMediaType: .audio,
      preferredTrackID: kCMPersistentTrackID_Invalid
    ) else {
      throw SessionError.noTrack
    }

    var offsets: [Double] = []
    var cursor = CMTime.zero

    for item in items {
      offsets.append(cursor.seconds)

      if item.kind == "silence" || item.uri == nil {
        // An empty stretch of timeline, rather than a wait someone has to notice
        // elapse. This is the whole reason a session survives a locked screen.
        let duration = CMTime(seconds: item.durationMs / 1000, preferredTimescale: 600)
        track.insertEmptyTimeRange(CMTimeRange(start: cursor, duration: duration))
        cursor = cursor + duration
        continue
      }

      guard let url = URL(string: item.uri!) else { throw SessionError.badUri(item.uri!) }
      let asset = AVURLAsset(url: url)
      let duration = try await asset.load(.duration)
      guard let source = try await asset.loadTracks(withMediaType: .audio).first else {
        throw SessionError.noAudio(item.uri!)
      }
      try track.insertTimeRange(
        CMTimeRange(start: .zero, duration: duration),
        of: source,
        at: cursor
      )
      cursor = cursor + duration
    }

    return (composition, offsets)
  }

  private func startBed(_ next: SessionSpec) {
    guard let uri = next.bedUri, let url = URL(string: uri) else { return }
    let queue = AVQueuePlayer()
    queue.volume = next.bedVolume
    // AVPlayerLooper, not a seek on the end notification: the beds are mastered
    // to join back to their own beginning, and this is the API that plays them
    // that way rather than re-buffering at every wrap.
    looper = AVPlayerLooper(player: queue, templateItem: AVPlayerItem(url: url))
    bed = queue
    queue.play()
  }

  private func activateSession() throws {
    let session = AVAudioSession.sharedInstance()
    // `.mixWithOthers` is deliberate: a meditation bed should sit alongside
    // whatever else the reader has going rather than seizing the output.
    try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
    try session.setActive(true)
  }

  // MARK: - observing

  private func observe(item: AVPlayerItem) {
    endObserver = NotificationCenter.default.addObserver(
      forName: .AVPlayerItemDidPlayToEndTime,
      object: item,
      queue: .main
    ) { [weak self] _ in self?.finish() }

    timeObserver = player?.addPeriodicTimeObserver(
      forInterval: CMTime(seconds: 0.25, preferredTimescale: 600),
      queue: .main
    ) { [weak self] time in self?.report(position: time.seconds) }
  }

  private func report(position: Double) {
    guard let spec else { return }

    // Which item the composition is inside, found by where it begins. The
    // caption follows this rather than a clock, so it can never drift from the
    // voice it is captioning.
    var index = startOffsets.count - 1
    while index > 0 && position < startOffsets[index] { index -= 1 }

    if index != currentIndex {
      currentIndex = index
      let cue = spec.items.indices.contains(index) ? spec.items[index].cueIndex : -1
      let kind = spec.items.indices.contains(index) ? spec.items[index].kind : "?"
      log.debug("item \(index)/\(spec.items.count) \(kind, privacy: .public) cue=\(cue)")
      onItemChanged?(index, cue)
    }

    if progressEnabled { onProgress?(position * 1000) }
  }

  private func positionSeconds() -> Double {
    guard let player, let time = player.currentItem?.currentTime() else { return 0 }
    return max(0, time.seconds)
  }

  private func finish() {
    guard let spec, !finished else { return }
    finished = true

    let endedAt = Date().timeIntervalSince1970 * 1000
    log.info("session=\(spec.sessionId, privacy: .public) finished after \(spec.durationSeconds)s; recording it")
    CompletionStore.record(
      .init(
        sessionId: spec.sessionId,
        endedAt: endedAt,
        durationSeconds: spec.durationSeconds,
        meditationId: spec.meditationId,
        title: spec.title
      )
    )
    onProgress?(spec.durationSeconds * 1000)
    onCompleted?(spec.sessionId, endedAt)
    stop(notify: false)
  }

  private func teardown() {
    if let timeObserver { player?.removeTimeObserver(timeObserver) }
    timeObserver = nil
    if let endObserver { NotificationCenter.default.removeObserver(endObserver) }
    endObserver = nil

    player?.pause()
    player = nil
    looper?.disableLooping()
    looper = nil
    bed?.pause()
    bed = nil
    spec = nil
    startOffsets = []
    currentIndex = -1
  }
}

enum SessionError: Error, LocalizedError {
  case noTrack
  case badUri(String)
  case noAudio(String)

  var errorDescription: String? {
    switch self {
    case .noTrack: return "could not add an audio track to the composition"
    case .badUri(let uri): return "not a usable uri: \(uri)"
    case .noAudio(let uri): return "no audio track in \(uri)"
    }
  }
}
