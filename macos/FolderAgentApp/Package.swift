// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MLABSFolderAgent",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "MLABSFolderAgent", targets: ["MLABSFolderAgent"])
    ],
    targets: [
        .executableTarget(
            name: "MLABSFolderAgent",
            resources: [
                .copy("Resources/music-agent.mjs")
            ]
        )
    ]
)
