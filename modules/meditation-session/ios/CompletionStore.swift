import Foundation

/**
 The record that a sit was seen through to its end.

 Written by the session itself, not by JavaScript, because the moment a
 meditation ends is exactly the moment the app is least likely to be awake to
 notice it. A session that finished with the screen locked is still recorded
 here, and the app collects it whenever it next runs.

 Nothing is written until the timeline actually ends, so a sit that was cut short
 leaves nothing behind. That is deliberate: an interrupted meditation is not a
 meditation, and it should not appear in the calendar.
 */
enum CompletionStore {
  private static let key = "expo.modules.meditationsession.completions"

  struct Completed {
    let sessionId: String
    let endedAt: Double
    let durationSeconds: Double
    let meditationId: String?
    let title: String?

    var asDictionary: [String: Any?] {
      [
        "sessionId": sessionId,
        "endedAt": endedAt,
        "durationSeconds": durationSeconds,
        "meditationId": meditationId,
        "title": title,
      ]
    }
  }

  static func record(_ completed: Completed) {
    var stored = raw()
    // The same sit can reach the end twice if a session is torn down mid-finish;
    // the app dedupes too, but not writing it twice is cheaper than reconciling.
    guard !stored.contains(where: { $0["sessionId"] as? String == completed.sessionId }) else { return }
    stored.append(completed.asDictionary.compactMapValues { $0 })
    UserDefaults.standard.set(stored, forKey: key)
  }

  static func read() -> [[String: Any]] {
    raw()
  }

  static func clear() {
    UserDefaults.standard.removeObject(forKey: key)
  }

  private static func raw() -> [[String: Any]] {
    UserDefaults.standard.array(forKey: key) as? [[String: Any]] ?? []
  }
}
