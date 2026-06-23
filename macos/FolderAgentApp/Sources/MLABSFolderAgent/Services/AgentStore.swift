import AppKit
import Foundation

@MainActor
final class AgentStore: ObservableObject {
    private static let audioExtensions = Set(["mp3", "wav", "aiff", "aif", "m4a", "aac", "flac"])
    private enum Keys {
        static let folderPath = "mlabs.agent.folderPath"
        static let email = "mlabs.agent.email"
        static let intervalMs = "mlabs.agent.intervalMs"
        static let silentMode = "mlabs.agent.silentMode"
        static let supabaseURL = "mlabs.agent.supabaseURL"
        static let supabaseAnonKey = "mlabs.agent.supabaseAnonKey"
    }

    @Published var folderPath = "" {
        didSet { UserDefaults.standard.set(folderPath, forKey: Keys.folderPath) }
    }
    @Published var email = "" {
        didSet { UserDefaults.standard.set(email, forKey: Keys.email) }
    }
    @Published var password = ""
    @Published var intervalMs = 2500 {
        didSet { UserDefaults.standard.set(intervalMs, forKey: Keys.intervalMs) }
    }
    @Published var silentMode = true {
        didSet { UserDefaults.standard.set(silentMode, forKey: Keys.silentMode) }
    }
    @Published var supabaseURL = "https://fenjuzfypyqsdkebpfsb.supabase.co" {
        didSet { UserDefaults.standard.set(supabaseURL, forKey: Keys.supabaseURL) }
    }
    @Published var supabaseAnonKey = "sb_publishable_CPPtU22MxhzUxNidXVxKRg_EcRc17-B" {
        didSet { UserDefaults.standard.set(supabaseAnonKey, forKey: Keys.supabaseAnonKey) }
    }
    @Published var isRunning = false
    @Published var statusText = "Agente parado"
    @Published var lastEvent = "Selecciona una carpeta musical para empezar."
    @Published var logs = ""
    @Published var isInspectingFolder = false
    @Published var folderTrackCount = 0
    @Published var folderChildFolderCount = 0
    @Published var sampleTracks: [String] = []

    private var process: Process?
    private var stdoutObserver: NSObjectProtocol?
    private var stderrObserver: NSObjectProtocol?

    init() {
        let defaults = UserDefaults.standard
        folderPath = defaults.string(forKey: Keys.folderPath) ?? ""
        email = defaults.string(forKey: Keys.email) ?? ""
        let storedInterval = defaults.integer(forKey: Keys.intervalMs)
        intervalMs = storedInterval == 0 ? 2500 : storedInterval
        if defaults.object(forKey: Keys.silentMode) != nil {
            silentMode = defaults.bool(forKey: Keys.silentMode)
        }
        supabaseURL = defaults.string(forKey: Keys.supabaseURL) ?? "https://fenjuzfypyqsdkebpfsb.supabase.co"
        supabaseAnonKey = defaults.string(forKey: Keys.supabaseAnonKey) ?? "sb_publishable_CPPtU22MxhzUxNidXVxKRg_EcRc17-B"

        if !folderPath.isEmpty {
            statusText = "Listo para conectar"
            lastEvent = "Se ha recuperado tu última carpeta local."
            inspectSelectedFolder()
        }
    }

    var configuration: AgentConfiguration {
        AgentConfiguration(
            folderPath: folderPath.trimmingCharacters(in: .whitespacesAndNewlines),
            email: email.trimmingCharacters(in: .whitespacesAndNewlines),
            password: password,
            intervalMs: max(intervalMs, 500),
            silentMode: silentMode,
            supabaseURL: supabaseURL.trimmingCharacters(in: .whitespacesAndNewlines),
            supabaseAnonKey: supabaseAnonKey.trimmingCharacters(in: .whitespacesAndNewlines)
        )
    }

    var canStart: Bool {
        let config = configuration
        return !config.folderPath.isEmpty && !config.email.isEmpty && !config.password.isEmpty && !config.supabaseURL.isEmpty && !config.supabaseAnonKey.isEmpty
    }

    func chooseFolder() {
        let panel = NSOpenPanel()
        panel.canChooseDirectories = true
        panel.canChooseFiles = false
        panel.allowsMultipleSelection = false
        panel.prompt = "Usar carpeta"
        panel.message = "Selecciona la carpeta local de música que quieres vigilar."

        if panel.runModal() == .OK {
            folderPath = panel.url?.path ?? ""
            statusText = "Carpeta conectada"
            lastEvent = "Carpeta seleccionada. Leyendo contenido local..."
            appendLog("[app] Carpeta seleccionada: \(folderPath)")
            inspectSelectedFolder()
        }
    }

    func start() {
        guard !isRunning else { return }
        let config = configuration

        guard canStart else {
            statusText = "Faltan datos"
            lastEvent = "Completa carpeta, email, contraseña y credenciales de Supabase."
            return
        }

        guard let nodePath = resolveNodePath() else {
            statusText = "Node no encontrado"
            lastEvent = "Instala Node.js o asegúrate de que `node` esté disponible en tu sistema."
            appendLog("[app] Node no encontrado en el sistema.")
            return
        }

        guard let scriptPath = Bundle.module.path(forResource: "music-agent", ofType: "mjs") else {
            statusText = "Agente no disponible"
            lastEvent = "No se encontró el script music-agent.mjs dentro de la app."
            appendLog("[app] No se encontró el recurso music-agent.mjs.")
            return
        }

        let process = Process()
        let outPipe = Pipe()
        let errPipe = Pipe()

        process.executableURL = URL(fileURLWithPath: nodePath)
        process.arguments = [
            scriptPath,
            config.folderPath,
            "--watch",
            "--interval", String(config.intervalMs),
            "--email", config.email,
            "--password", config.password,
        ] + (config.silentMode ? ["--silent"] : [])
        process.currentDirectoryURL = URL(fileURLWithPath: config.folderPath)
        process.environment = mergedEnvironment(
            supabaseURL: config.supabaseURL,
            supabaseAnonKey: config.supabaseAnonKey,
            email: config.email,
            password: config.password
        )
        process.standardOutput = outPipe
        process.standardError = errPipe
        process.terminationHandler = { [weak self] finished in
            let reason = finished.terminationReason
            let code = finished.terminationStatus
            Task { @MainActor [weak self] in
                self?.handleTermination(reason: reason, code: code)
            }
        }

        observe(pipe: outPipe, isError: false)
        observe(pipe: errPipe, isError: true)

        do {
            try process.run()
            self.process = process
            isRunning = true
            statusText = "Watch activo"
            lastEvent = "Vigilando cambios en tu carpeta musical."
            appendLog("[app] Agente iniciado para \(config.folderPath)")
        } catch {
            statusText = "No se pudo iniciar"
            lastEvent = error.localizedDescription
            appendLog("[app] Error iniciando agente: \(error.localizedDescription)")
            clearObservers()
        }
    }

    func stop() {
        process?.terminate()
        process = nil
        clearObservers()
        if isRunning {
            isRunning = false
            statusText = "Agente parado"
            lastEvent = "El watch se ha detenido."
            appendLog("[app] Agente detenido.")
        }
    }

    func inspectSelectedFolder() {
        let targetPath = folderPath.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !targetPath.isEmpty else { return }

        isInspectingFolder = true
        folderTrackCount = 0
        folderChildFolderCount = 0
        sampleTracks = []

        Task.detached(priority: .userInitiated) { [targetPath] in
            let scan = Self.scanFolder(at: targetPath)

            await MainActor.run {
                self.isInspectingFolder = false
                self.folderTrackCount = scan.trackCount
                self.folderChildFolderCount = scan.childFolderCount
                self.sampleTracks = scan.sampleTracks
                self.statusText = "Carpeta lista"
                self.lastEvent = scan.trackCount == 0
                    ? "No se encontraron audios compatibles dentro de la carpeta."
                    : "Se han detectado \(scan.trackCount) audios en \(scan.childFolderCount) subcarpetas."
                self.appendLog("[app] Lectura local: \(scan.trackCount) audios · \(scan.childFolderCount) subcarpetas")
            }
        }
    }

    private func resolveNodePath() -> String? {
        let candidates = [
            "/opt/homebrew/bin/node",
            "/usr/local/bin/node",
            "/usr/bin/node"
        ]

        if let direct = candidates.first(where: { FileManager.default.isExecutableFile(atPath: $0) }) {
            return direct
        }

        let which = Process()
        let pipe = Pipe()
        which.executableURL = URL(fileURLWithPath: "/usr/bin/which")
        which.arguments = ["node"]
        which.standardOutput = pipe

        do {
            try which.run()
            which.waitUntilExit()
            let data = pipe.fileHandleForReading.readDataToEndOfFile()
            let path = String(decoding: data, as: UTF8.self).trimmingCharacters(in: .whitespacesAndNewlines)
            return path.isEmpty ? nil : path
        } catch {
            return nil
        }
    }

    private func mergedEnvironment(supabaseURL: String, supabaseAnonKey: String, email: String, password: String) -> [String: String] {
        var environment = ProcessInfo.processInfo.environment
        environment["PUBLIC_SUPABASE_URL"] = supabaseURL
        environment["PUBLIC_SUPABASE_ANON_KEY"] = supabaseAnonKey
        environment["MLABS_AGENT_EMAIL"] = email
        environment["MLABS_AGENT_PASSWORD"] = password
        return environment
    }

    private func observe(pipe: Pipe, isError: Bool) {
        let handle = pipe.fileHandleForReading
        let observer = NotificationCenter.default.addObserver(
            forName: .NSFileHandleDataAvailable,
            object: handle,
            queue: .main
        ) { [weak self] _ in
            let data = handle.availableData
            guard !data.isEmpty else { return }
            let text = String(decoding: data, as: UTF8.self)
            Task { @MainActor [weak self] in
                self?.consume(text: text, isError: isError)
            }
            handle.waitForDataInBackgroundAndNotify()
        }

        if isError {
            stderrObserver = observer
        } else {
            stdoutObserver = observer
        }

        handle.waitForDataInBackgroundAndNotify()
    }

    private func consume(text: String, isError: Bool) {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }
        appendLog(trimmed)
        if let lastLine = trimmed.split(separator: "\n").last {
            lastEvent = String(lastLine)
        }
        if isError {
            statusText = "Sync con avisos"
        }
    }

    private func handleTermination(reason: Process.TerminationReason, code: Int32) {
        clearObservers()
        process = nil
        isRunning = false
        switch reason {
        case .exit where code == 0:
            statusText = "Agente parado"
            lastEvent = "El proceso terminó correctamente."
        case .exit:
            statusText = "Proceso cerrado"
            lastEvent = "El agente terminó con código \(code)."
        case .uncaughtSignal:
            statusText = "Proceso interrumpido"
            lastEvent = "El agente recibió una señal del sistema."
        @unknown default:
            statusText = "Estado desconocido"
            lastEvent = "El agente terminó por una razón no reconocida."
        }
    }

    private func clearObservers() {
        if let stdoutObserver {
            NotificationCenter.default.removeObserver(stdoutObserver)
            self.stdoutObserver = nil
        }
        if let stderrObserver {
            NotificationCenter.default.removeObserver(stderrObserver)
            self.stderrObserver = nil
        }
    }

    private func appendLog(_ line: String) {
        let timestamp = DateFormatter.agentTime.string(from: Date())
        let entry = "[\(timestamp)] \(line)"
        logs = logs.isEmpty ? entry : "\(logs)\n\(entry)"
    }

    nonisolated private static func scanFolder(at folderPath: String) -> (trackCount: Int, childFolderCount: Int, sampleTracks: [String]) {
        let url = URL(fileURLWithPath: folderPath)
        let keys: [URLResourceKey] = [.isDirectoryKey, .nameKey]
        guard let enumerator = FileManager.default.enumerator(
            at: url,
            includingPropertiesForKeys: keys,
            options: [.skipsHiddenFiles]
        ) else {
            return (0, 0, [])
        }

        var trackCount = 0
        var childFolderCount = 0
        var sampleTracks: [String] = []

        for case let fileURL as URL in enumerator {
            guard let values = try? fileURL.resourceValues(forKeys: Set(keys)) else { continue }

            if values.isDirectory == true {
                if fileURL.path != folderPath {
                    childFolderCount += 1
                }
                continue
            }

            let ext = fileURL.pathExtension.lowercased()
            guard audioExtensions.contains(ext) else { continue }

            trackCount += 1
            if sampleTracks.count < 6 {
                sampleTracks.append(fileURL.lastPathComponent)
            }
        }

        return (trackCount, childFolderCount, sampleTracks)
    }
}

private extension DateFormatter {
    static let agentTime: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm:ss"
        return formatter
    }()
}
