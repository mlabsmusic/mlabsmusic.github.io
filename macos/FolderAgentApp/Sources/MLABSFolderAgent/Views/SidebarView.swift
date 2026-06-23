import SwiftUI

struct SidebarView: View {
    @ObservedObject var store: AgentStore

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Estado")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                    VStack(alignment: .leading, spacing: 10) {
                        Label(store.statusText, systemImage: store.isRunning ? "waveform.path.ecg" : "pause.circle")
                            .font(.headline)
                        Text(store.lastEvent)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Carpeta")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                    VStack(alignment: .leading, spacing: 10) {
                        Text(store.folderPath.isEmpty ? "No hay carpeta seleccionada." : store.folderPath)
                            .font(.subheadline)
                            .foregroundStyle(store.folderPath.isEmpty ? .secondary : .primary)
                            .textSelection(.enabled)
                            .fixedSize(horizontal: false, vertical: true)
                        Button("Elegir carpeta") {
                            store.chooseFolder()
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Acciones")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)
                    VStack(alignment: .leading, spacing: 10) {
                        Button(store.isRunning ? "Detener watch" : "Iniciar watch") {
                            store.isRunning ? store.stop() : store.start()
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(!store.isRunning && !store.canStart)

                        Button("Abrir ajustes") {
                            NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
                        }
                        .buttonStyle(.bordered)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(14)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14))
                }
            }
            .padding(18)
        }
        .background(.regularMaterial)
    }
}
