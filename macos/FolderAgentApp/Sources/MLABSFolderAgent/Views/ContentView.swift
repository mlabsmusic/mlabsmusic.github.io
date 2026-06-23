import SwiftUI

struct ContentView: View {
    @ObservedObject var store: AgentStore

    var body: some View {
        HSplitView {
            SidebarView(store: store)
                .frame(minWidth: 260, idealWidth: 300, maxWidth: 340)

            DetailView(store: store)
                .frame(minWidth: 540, maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}
