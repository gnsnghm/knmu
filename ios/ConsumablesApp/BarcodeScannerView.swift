import SwiftUI
import VisionKit

struct BarcodeScannerView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> DataScannerViewController {
        let controller = DataScannerViewController(
            recognizedDataTypes: [.barcode(symbologies: [.ean13, .ean8, .upce])],
            isGuidanceEnabled: true,
            isHighlightingEnabled: true
        )
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: DataScannerViewController, context: Context) {}

    func makeCoordinator() -> Coordinator { Coordinator() }

    class Coordinator: NSObject, DataScannerViewControllerDelegate {
        func dataScanner(_ dataScanner: DataScannerViewController, didTap item: RecognizedItem) {
            if case let .barcode(barcode) = item {
                if let payload = barcode.payloadStringValue {
                    // TODO: call backend API with JAN code
                    print("Scanned: \(payload)")
                }
            }
        }
    }
}