import Foundation

/// The response structure from the Vici AI coach
struct ViciResponse: Codable {
    /// The text answer from the AI coach
    let answerText: String
    
    /// Whether the response contains structured changes to a plan
    let hasStructuredChanges: Bool
    
    /// Optional proposed changes to a plan
    let proposedChanges: ProposedChanges?
    
    /// The timestamp of when the response was generated
    let timestamp: String
    
    /// CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case answerText
        case hasStructuredChanges
        case proposedChanges
        case timestamp
    }
}

/// Structure for proposed plan changes from the AI coach
struct ProposedChanges: Codable {
    /// Adjustments to the plan (flexible structure)
    let adjustments: [String: AnyCodable]?
    
    /// CodingKeys to map between Swift and API JSON
    enum CodingKeys: String, CodingKey {
        case adjustments
    }
}

/// A type that can hold any Codable value
struct AnyCodable: Codable {
    private let value: Any
    
    init(_ value: Any) {
        self.value = value
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        
        if container.decodeNil() {
            self.value = NSNull()
        } else if let bool = try? container.decode(Bool.self) {
            self.value = bool
        } else if let int = try? container.decode(Int.self) {
            self.value = int
        } else if let double = try? container.decode(Double.self) {
            self.value = double
        } else if let string = try? container.decode(String.self) {
            self.value = string
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = array
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            self.value = dict
        } else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Unable to decode value")
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        
        switch self.value {
        case is NSNull:
            try container.encodeNil()
        case let bool as Bool:
            try container.encode(bool)
        case let int as Int:
            try container.encode(int)
        case let double as Double:
            try container.encode(double)
        case let string as String:
            try container.encode(string)
        case let array as [Any]:
            try container.encode(array.map { AnyCodable($0) })
        case let dict as [String: Any]:
            try container.encode(dict.mapValues { AnyCodable($0) })
        default:
            throw EncodingError.invalidValue(self.value, EncodingError.Context(
                codingPath: container.codingPath,
                debugDescription: "Value cannot be encoded"
            ))
        }
    }
}

extension AnyCodable: Equatable {
    static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        switch (lhs.value, rhs.value) {
        case (is NSNull, is NSNull): return true
        case let (lhs as Bool, rhs as Bool): return lhs == rhs
        case let (lhs as Int, rhs as Int): return lhs == rhs
        case let (lhs as Double, rhs as Double): return lhs == rhs
        case let (lhs as String, rhs as String): return lhs == rhs
        case let (lhs as [AnyCodable], rhs as [AnyCodable]): return lhs == rhs
        case let (lhs as [String: AnyCodable], rhs as [String: AnyCodable]): return lhs == rhs
        default: return false
        }
    }
} 