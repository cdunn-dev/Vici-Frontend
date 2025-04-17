import Foundation

// ****************************************************************************************
// *** DEPRECATED: This file will be removed in a future update
// *** This was a simplified version of the ViciResponse model
// *** The proper implementation is now in Models/ViciResponse.swift
// ****************************************************************************************

// Simple model for AI responses from the coach
struct ViciResponse: Codable {
    let responseType: String  // "text" or "plan_changes"
    let text: String          // Response text
    let changes: Changes?     // Optional changes to the plan
    
    struct Changes: Codable {
        let planId: String
        let workoutChanges: [WorkoutChange]?
        
        struct WorkoutChange: Codable {
            let workoutId: String
            let changes: [String: String]  // Field that changed and new value
        }
    }
} 