import AppKit
import SwiftUI

@main
struct MLABSFolderAgentApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = AgentStore()

    var body: some Scene {
        WindowGroup("MLABS Folder Agent") {
            ContentView(store: store)
                .frame(minWidth: 860, minHeight: 620)
        }
        .defaultSize(width: 960, height: 680)

        Settings {
            SettingsView(store: store)
                .frame(width: 540)
                .padding(24)
        }
    }
}

final class AppDelegate: NSObject, NSApplicationDelegate {
    func applicationDidFinishLaunching(_ notification: Notification) {
        NSApp.setActivationPolicy(.regular)
        NSApp.activate(ignoringOtherApps: true)
    }
}
