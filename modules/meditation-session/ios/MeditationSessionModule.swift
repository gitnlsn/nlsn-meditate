import ExpoModulesCore

struct TimelineItemRecord: Record {
  @Field var kind: String = "silence"
  @Field var uri: String?
  @Field var ms: Double = 0
  @Field var cueIndex: Int = -1
}

struct StartOptionsRecord: Record {
  @Field var sessionId: String = ""
  @Field var durationSeconds: Double = 0
  @Field var items: [TimelineItemRecord] = []
  @Field var voiceVolume: Double = 1
  @Field var bedUri: String?
  @Field var bedVolume: Double = 0.6
  @Field var meditationId: String?
  @Field var title: String?
}

/**
 The app's handle on a meditation that runs without it.

 Deliberately thin, and the same shape as its Android counterpart so the screens
 cannot tell which one they are talking to. Everything the session needs to reach
 its end lives in `MeditationSession`; what crosses back here is only what a
 screen needs in order to draw — which line is being spoken, how far along we are
 — and one message saying it finished.
 */
public class MeditationSessionModule: Module {
  private let session = MeditationSession()

  public func definition() -> ModuleDefinition {
    Name("MeditationSession")

    Events("onProgress", "onItemChanged", "onStateChanged", "onCompleted", "onError")

    OnCreate {
      session.onItemChanged = { [weak self] index, cueIndex in
        self?.sendEvent("onItemChanged", ["index": index, "cueIndex": cueIndex])
      }
      session.onStateChanged = { [weak self] state in
        self?.sendEvent("onStateChanged", ["state": state])
      }
      session.onProgress = { [weak self] positionMs in
        self?.sendEvent("onProgress", ["positionMs": positionMs])
      }
      session.onCompleted = { [weak self] sessionId, endedAt in
        self?.sendEvent("onCompleted", ["sessionId": sessionId, "endedAt": endedAt])
      }
      session.onError = { [weak self] message in
        self?.sendEvent("onError", ["message": message])
      }
    }

    /*
     * Everything that touches a player runs on the main queue, as AVFoundation
     * expects. `start` hands back its own promise instead, because assembling
     * the composition has to read the duration of every clip before it can lay
     * the next one down, and that waiting should not block the queue.
     */
    AsyncFunction("start") { (options: StartOptionsRecord, promise: Promise) in
      let spec = SessionSpec(
        sessionId: options.sessionId,
        durationSeconds: options.durationSeconds,
        items: options.items.map {
          TimelineItem(kind: $0.kind, uri: $0.uri, durationMs: $0.ms, cueIndex: $0.cueIndex)
        },
        voiceVolume: Float(options.voiceVolume),
        bedUri: options.bedUri,
        bedVolume: Float(options.bedVolume),
        meditationId: options.meditationId,
        title: options.title
      )
      Task { @MainActor in
        await self.session.start(spec)
        promise.resolve(nil)
      }
    }

    AsyncFunction("pause") { self.session.pause() }.runOnQueue(.main)

    AsyncFunction("resume") { self.session.resume() }.runOnQueue(.main)

    AsyncFunction("stop") { self.session.stop() }.runOnQueue(.main)

    AsyncFunction("getState") { () -> [String: Any]? in
      self.session.snapshot()
    }.runOnQueue(.main)

    AsyncFunction("setProgressUpdates") { (enabled: Bool) in
      self.session.setProgressUpdates(enabled)
    }.runOnQueue(.main)

    /**
     Hand over every sit that reached its end, and forget them.

     Read-then-clear rather than clear-on-acknowledge: the app writes them to its
     own history keyed by session id, so the worst a lost race can do is record
     the same sit twice, which that key already makes harmless.
     */
    AsyncFunction("drainCompletions") { () -> [[String: Any]] in
      let completions = CompletionStore.read()
      CompletionStore.clear()
      return completions
    }
  }
}
