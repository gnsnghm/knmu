import SwiftUI

struct ContentView: View {
    @State private var showScanner = false

    var body: some View {
        NavigationStack {
            List {
                Text("Scan a barcode to begin…")
            }
            .navigationTitle("Consumables")
            .toolbar {
                Button {
                    showScanner.toggle()
                } label: {
                    Label("Scan", systemImage: "barcode.viewfinder")
                }
            }
            .sheet(isPresented: $showScanner) {
                BarcodeScannerView()
            }
        }
    }
}