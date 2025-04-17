import Foundation
@testable import ViciMVP

/// A sample model for testing JSON decoding/encoding
/// 
/// This struct demonstrates a standard implementation of a Codable, Identifiable
/// model with typical properties and custom coding keys. It can be used for:
/// - Testing API response parsing
/// - Creating mock data for UI testing
/// - Demonstrating Swift naming and coding conventions
struct SampleCodableModel: Codable, Identifiable {
    /// Unique identifier for the model
    var id: String
    
    /// The name or title of the item
    var name: String
    
    /// Optional description text
    var description: String?
    
    /// Timestamp when the item was created
    var createdAt: Date
    
    /// Demonstrates custom coding keys for JSON snake_case to Swift camelCase conversion
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case description
        case createdAt = "created_at"
    }
    
    /// Creates a sample instance for testing
    static func createSample() -> SampleCodableModel {
        return SampleCodableModel(
            id: "sample-123",
            name: "Sample Item",
            description: "This is a sample item for testing",
            createdAt: Date()
        )
    }
    
    /// Sample JSON data that can be used for testing decoding
    static var sampleJSON: [String: Any] {
        return [
            "id": "sample-123",
            "name": "Sample Item",
            "description": "This is a sample item for testing",
            "created_at": ISO8601DateFormatter().string(from: Date())
        ]
    }
} 