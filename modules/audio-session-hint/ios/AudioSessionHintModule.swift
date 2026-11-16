import AVFoundation
import ExpoModulesCore

// Read-only window into iOS AVAudioSession for QuizVibe's background music
// (approved Q2, plan rev 3, 2026-11-16).
//
// `secondaryAudioShouldBeSilencedHint` is true while another app is playing
// non-mixable audio (Spotify, Apple Music, podcasts). Background music must
// then stay silent. The system posts `silenceSecondaryAudioHintNotification`
// when that starts or stops.
//
// This module NEVER changes the audio session: no category, no options, no
// setActive, no background mode. Apple Guideline 2.5.4 fix (b6d08cc) stays
// untouched — the module adds nothing to Info.plist.
public class AudioSessionHintModule: Module {
  private var observer: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("AudioSessionHint")

    Events("onHintChange")

    Function("isOtherAudioPlaying") { () -> Bool in
      return AVAudioSession.sharedInstance().secondaryAudioShouldBeSilencedHint
    }

    OnStartObserving {
      self.startObserving()
    }

    OnStopObserving {
      self.stopObserving()
    }

    OnDestroy {
      self.stopObserving()
    }
  }

  private func startObserving() {
    guard observer == nil else { return }
    observer = NotificationCenter.default.addObserver(
      forName: AVAudioSession.silenceSecondaryAudioHintNotification,
      object: AVAudioSession.sharedInstance(),
      queue: .main
    ) { [weak self] _ in
      let silence = AVAudioSession.sharedInstance().secondaryAudioShouldBeSilencedHint
      self?.sendEvent("onHintChange", ["otherAudioPlaying": silence])
    }
  }

  private func stopObserving() {
    if let observer = observer {
      NotificationCenter.default.removeObserver(observer)
    }
    observer = nil
  }
}
