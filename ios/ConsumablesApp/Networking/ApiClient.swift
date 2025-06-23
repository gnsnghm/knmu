import Foundation

struct Product: Decodable {       // Model は別ファイルでも可
    let id: Int
    let barcode: String
    let name: String
    let image_url: String?
    let brand: String?
}

enum APIError: Error { case notFound, server }

final class ApiClient {
    static let shared = ApiClient()
    private let base = URL(string: "https://household.tnmu.dev")!

    private init() {}

    func fetchItem(jan: String) async throws -> Product {
        let url = base.appendingPathComponent("/items/\(jan)")
        let (data, resp) = try await URLSession.shared.data(from: url)   // Node 20 の fetch と同様のシンプルさ :contentReference[oaicite:4]{index=4}
        guard let http = resp as? HTTPURLResponse else { throw APIError.server }
        switch http.statusCode {
        case 200: return try JSONDecoder().decode(Product.self, from: data)
        case 404: throw APIError.notFound
        default:  throw APIError.server
        }
    }
}