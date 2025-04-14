import Foundation

// MARK: - Training Models

// Workout Intensity Level
enum IntensityLevel: String, Codable, CaseIterable {
    case veryLow = "Very Low"
    case low = "Low"
    case moderate = "Moderate"
    case high = "High"
    case veryHigh = "Very High"
}

// Workout Type
enum WorkoutType: String, Codable, CaseIterable {
    case easy = "Easy Run"
    case tempo = "Tempo Run"
    case interval = "Interval"
    case longRun = "Long Run"
    case recovery = "Recovery"
    case fartlek = "Fartlek"
    case hillRepeats = "Hill Repeats"
}

// Goal Type
enum GoalType: String, Codable, CaseIterable {
    case general = "General Fitness"
    case race = "Race Training"
}

// Workout Status
enum WorkoutStatus: String, Codable, CaseIterable {
    case scheduled = "Scheduled"
    case completed = "Completed"
    case skipped = "Skipped"
    case missed = "Missed"
}

// Workout Model
struct Workout: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let type: WorkoutType
    let intensityLevel: IntensityLevel
    let date: Date
    let plannedDistance: Double // in meters
    let estimatedDuration: TimeInterval // in seconds
    var status: WorkoutStatus
    var completedActivity: Activity?
}

// Training Plan Model
struct TrainingPlan: Identifiable, Codable {
    let id: String
    let name: String
    let objective: String?
    let goalType: GoalType
    let startDate: Date
    let endDate: Date
    let totalWeeks: Int
    let currentWeek: Int
    let currentWeekWorkouts: [Workout]
    let currentWeekDistance: Double // in meters
    let notes: String?
    
    // Mock data
    static var mockCurrentPlan: TrainingPlan {
        let calendar = Calendar.current
        let today = Date()
        let startOfToday = calendar.startOfDay(for: today)
        
        // Create date components for this week
        let monday = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekDates = (0...6).map { day in
            calendar.date(byAdding: .day, value: day, to: monday)!
        }
        
        // Create workouts for this week
        var weekWorkouts: [Workout] = []
        
        // Monday - Easy Run
        weekWorkouts.append(Workout(
            id: "w1",
            title: "Easy Recovery Run",
            description: "Start the week with a gentle recovery run to flush out any fatigue from the weekend.",
            type: .easy,
            intensityLevel: .low,
            date: weekDates[0],
            plannedDistance: 5000, // 5km
            estimatedDuration: 1800, // 30min
            status: calendar.isDateInToday(weekDates[0]) ? .scheduled : (weekDates[0] < today ? .completed : .scheduled),
            completedActivity: nil
        ))
        
        // Tuesday - Rest day (no workout)
        
        // Wednesday - Intervals
        weekWorkouts.append(Workout(
            id: "w2",
            title: "Interval Workout",
            description: "6 x 400m repeats with 200m recovery jogs. Target pace 10-15 sec/km faster than 5K pace.",
            type: .interval,
            intensityLevel: .high,
            date: weekDates[2],
            plannedDistance: 7000, // 7km with warmup/cooldown
            estimatedDuration: 2400, // 40min
            status: calendar.isDateInToday(weekDates[2]) ? .scheduled : (weekDates[2] < today ? .completed : .scheduled),
            completedActivity: nil
        ))
        
        // Thursday - Rest day (no workout)
        
        // Friday - Tempo Run
        weekWorkouts.append(Workout(
            id: "w3",
            title: "Tempo Run",
            description: "Warm up 10min, 20min at marathon pace, 10min cooldown.",
            type: .tempo,
            intensityLevel: .moderate,
            date: weekDates[4],
            plannedDistance: 8000, // 8km
            estimatedDuration: 2700, // 45min
            status: calendar.isDateInToday(weekDates[4]) ? .scheduled : (weekDates[4] < today ? .completed : .scheduled),
            completedActivity: nil
        ))
        
        // Saturday - Easy Run
        weekWorkouts.append(Workout(
            id: "w4",
            title: "Easy Run",
            description: "Easy effort run with focus on good form. Keep the effort conversational.",
            type: .easy,
            intensityLevel: .low,
            date: weekDates[5],
            plannedDistance: 6000, // 6km
            estimatedDuration: 2100, // 35min
            status: calendar.isDateInToday(weekDates[5]) ? .scheduled : (weekDates[5] < today ? .completed : .scheduled),
            completedActivity: nil
        ))
        
        // Sunday - Long Run
        weekWorkouts.append(Workout(
            id: "w5",
            title: "Long Run",
            description: "Weekly long run to build endurance. Keep the pace easy and focus on time on feet.",
            type: .longRun,
            intensityLevel: .moderate,
            date: weekDates[6],
            plannedDistance: 16000, // 16km
            estimatedDuration: 5400, // 90min
            status: calendar.isDateInToday(weekDates[6]) ? .scheduled : (weekDates[6] < today ? .completed : .scheduled),
            completedActivity: nil
        ))
        
        // Create the mock plan
        return TrainingPlan(
            id: "plan1",
            name: "Half Marathon Training",
            objective: "Prepare for the City Half Marathon on November 15",
            goalType: .race,
            startDate: calendar.date(byAdding: .day, value: -28, to: today)!, // 4 weeks ago
            endDate: calendar.date(byAdding: .day, value: 56, to: today)!, // 8 weeks from now
            totalWeeks: 12,
            currentWeek: 5,
            currentWeekWorkouts: weekWorkouts,
            currentWeekDistance: 42000, // 42km for the week
            notes: "Focus on building your base mileage this week. The tempo run on Friday is key - really try to dial in that marathon pace feeling."
        )
    }
} 