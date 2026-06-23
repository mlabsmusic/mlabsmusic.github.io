import SwiftUI

struct SettingsView: View {
    @ObservedObject var store: AgentStore

    var body: some View {
        Form {
            Section("Cuenta del DJ") {
                TextField("Email", text: $store.email)
                    .textContentType(.emailAddress)
                SecureField("Contraseña", text: $store.password)
            }

            Section("Sync") {
                TextField("Supabase URL", text: $store.supabaseURL)
                TextField("Supabase anon key", text: $store.supabaseAnonKey)
                Stepper(value: $store.intervalMs, in: 500...20000, step: 500) {
                    Text("Intervalo: \(store.intervalMs) ms")
                }
                Toggle("Modo silencioso", isOn: $store.silentMode)
            }
        }
        .formStyle(.grouped)
    }
}
