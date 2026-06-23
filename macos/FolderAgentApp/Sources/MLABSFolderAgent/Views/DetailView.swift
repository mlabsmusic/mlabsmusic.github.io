import SwiftUI

struct DetailView: View {
    @ObservedObject var store: AgentStore

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 10) {
                Text("Control local de tu librería")
                    .font(.largeTitle.bold())
                Text("Esta app vigila una carpeta musical real de tu Mac, detecta cambios y los manda a tu workspace de MLABS para que luego puedas revisar, guardar y compartir solo lo que te interese.")
                    .font(.title3)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: 12) {
                statusCard(title: "Modo", value: store.isRunning ? "Watch activo" : "Pausado")
                statusCard(title: "Intervalo", value: "\(store.intervalMs) ms")
                statusCard(title: "Salida", value: store.silentMode ? "Silenciosa" : "Detallada")
            }

            GroupBox {
                VStack(alignment: .leading, spacing: 14) {
                    HStack(alignment: .center) {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Carpeta conectada")
                                .font(.headline)
                            Text(store.folderPath.isEmpty ? "Todavía no has elegido una carpeta." : store.folderPath)
                                .foregroundStyle(store.folderPath.isEmpty ? .secondary : .primary)
                                .textSelection(.enabled)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                        Spacer()
                        if store.isInspectingFolder {
                            ProgressView()
                                .controlSize(.small)
                        }
                    }

                    HStack(spacing: 12) {
                        folderCard(title: "Audios detectados", value: "\(store.folderTrackCount)")
                        folderCard(title: "Subcarpetas", value: "\(store.folderChildFolderCount)")
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Muestra rápida")
                            .font(.subheadline.weight(.semibold))
                        if store.sampleTracks.isEmpty {
                            Text(store.folderPath.isEmpty ? "Elige una carpeta y te mostraremos una vista previa local." : "No hay audios compatibles visibles todavía.")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(store.sampleTracks, id: \.self) { track in
                                Label(track, systemImage: "music.note")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(6)
            }

            GroupBox {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Último evento")
                        .font(.headline)
                    Text(store.lastEvent)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(6)
            }

            GroupBox {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("Log del agente")
                            .font(.headline)
                        Spacer()
                        if !store.logs.isEmpty {
                            Button("Limpiar") {
                                store.logs = ""
                            }
                            .buttonStyle(.borderless)
                        }
                    }

                    ScrollView {
                        Text(store.logs.isEmpty ? "Aquí verás la actividad del agente cuando empiece a trabajar." : store.logs)
                            .font(.system(.body, design: .monospaced))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .textSelection(.enabled)
                            .padding(12)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .background(.quaternary.opacity(0.25), in: RoundedRectangle(cornerRadius: 12))
                }
                .padding(6)
            }
            .frame(maxHeight: .infinity)
        }
        .padding(24)
        .toolbar {
            ToolbarItemGroup {
                Button(store.isRunning ? "Detener" : "Iniciar") {
                    store.isRunning ? store.stop() : store.start()
                }
                .disabled(!store.isRunning && !store.canStart)

                Button("Carpeta") {
                    store.chooseFolder()
                }
            }
        }
    }

    private func statusCard(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title.uppercased())
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.headline)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func folderCard(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(title)
                .font(.caption.weight(.semibold))
                .foregroundStyle(.secondary)
            Text(value)
                .font(.title3.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.quaternary.opacity(0.25), in: RoundedRectangle(cornerRadius: 12))
    }
}
