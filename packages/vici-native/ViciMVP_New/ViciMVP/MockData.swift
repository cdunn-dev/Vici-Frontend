import Foundation

// MARK: - Mock Data for Vici MVP App

// User model
struct User: Identifiable, Codable {
    let id: String
    var email: String
    var name: String
    var profilePictureUrl: String?
    var dateOfBirth: Date?
    var gender: Gender
    var experienceLevel: ExperienceLevel
    var currentFitnessLevel: Double // Score between 0-100
    var personalBests: [PersonalBest]
    var isStravaConnected: Bool
    
    static let current = User(
        id: "user123",
        email: "runner@example.com",
        name: "Jane Runner",
        profilePictureUrl: nil,
        dateOfBirth: Calendar.current.date(from: DateComponents(year: 1990, month: 5, day: 15)),
        gender: .female,
        experienceLevel: .intermediate,
        currentFitnessLevel: 72.5,
        personalBests: [
            PersonalBest(distance: 5000, time: 1500, date: Date().addingTimeInterval(-30*24*60*60)),
            PersonalBest(distance: 10000, time: 3300, date: Date().addingTimeInterval(-60*24*60*60)),
            PersonalBest(distance: 21097, time: 7200, date: Date().addingTimeInterval(-90*24*60*60))
        ],
        isStravaConnected: false
    )
}

// MARK: - Enums

enum Gender: String, Codable, CaseIterable {
    case male = "Male"
    case female = "Female"
    case nonBinary = "Non-binary"
    case preferNotToSay = "Prefer not to say"
    
    var id: String { self.rawValue }
}

enum ExperienceLevel: String, Codable, CaseIterable {
    case beginner = "Beginner"
    case intermediate = "Intermediate"
    case advanced = "Advanced"
    
    var id: String { self.rawValue }
}

// MARK: - Models

struct PersonalBest: Identifiable, Codable {
    let id = UUID()
    let distance: Double // in meters
    let time: TimeInterval // in seconds
    let date: Date
    
    var formattedDistance: String {
        let km = distance / 1000
        return String(format: "%.1f km", km)
    }
    
    var formattedTime: String {
        let minutes = Int(time) / 60
        let seconds = Int(time) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
    
    var pace: TimeInterval {
        // Pace in seconds per km
        return time / (distance / 1000)
    }
    
    var formattedPace: String {
        let minutes = Int(pace) / 60
        let seconds = Int(pace) % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
}

// Training Plan model
struct TrainingPlan: Identifiable, Codable {
    let id: String
    let name: String
    let description: String
    let goalType: GoalType
    let distance: Double?
    let duration: Int?
    let difficulty: ExperienceLevel
    let startDate: Date
    let endDate: Date
    let currentWeek: Int
    let totalWeeks: Int
    let currentWeekWorkouts: [Workout]
    let currentWeekDistance: Double // in meters
    let notes: String?
    let objective: String?
    
    static let examples = [
        TrainingPlan(
            id: "plan1",
            name: "10K Training Plan",
            description: "A 10K training plan for beginners to improve endurance",
            goalType: .race,
            distance: 10000,
            duration: 8,
            difficulty: .beginner,
            startDate: Date().addingTimeInterval(-30*24*60*60),
            endDate: Date().addingTimeInterval(30*24*60*60),
            currentWeek: 5,
            totalWeeks: 12,
            currentWeekWorkouts: Workout.exampleWeek,
            currentWeekDistance: 30000,
            notes: "Focus on building your base mileage this week. The tempo run on Friday is key - really try to dial in that marathon pace feeling.",
            objective: "Complete a 10K race in under 60 minutes"
        ),
        TrainingPlan(
            id: "plan2",
            name: "Half Marathon Plan",
            description: "A half marathon plan for intermediate runners",
            goalType: .race,
            distance: 21097,
            duration: 12,
            difficulty: .intermediate,
            startDate: Date().addingTimeInterval(-60*24*60*60),
            endDate: Date().addingTimeInterval(60*24*60*60),
            currentWeek: 5,
            totalWeeks: 12,
            currentWeekWorkouts: Workout.exampleWeek,
            currentWeekDistance: 45000,
            notes: "This is a peak week with higher volume. Make sure to focus on recovery after your workouts.",
            objective: "Complete a half marathon in under 2 hours"
        )
    ]
    
    static var mockCurrentPlan: TrainingPlan {
        return examples[1]
    }
}

// WeekSummary for display in overview
struct WeekSummary: Identifiable {
    let id: String
    let weekNumber: Int
    let startDate: Date
    let endDate: Date
    let focus: String
    let totalDistance: Double // km
    let completedDistance: Double // km
    let progressPercentage: Double // 0-1
}

enum PlanStatus: String {
    case preview = "Preview"
    case active = "Active"
    case completed = "Completed"
    case cancelled = "Cancelled"
}

struct Goal {
    let type: GoalType
    let raceName: String?
    let distance: Double? // meters
    let date: Date?
    let previousPb: TimeInterval? // seconds
    let goalTime: TimeInterval? // seconds
    
    var formattedGoalTime: String? {
        guard let time = goalTime else { return nil }
        let hours = Int(time) / 3600
        let minutes = (Int(time) % 3600) / 60
        let seconds = Int(time) % 60
        return hours > 0 ? String(format: "%d:%02d:%02d", hours, minutes, seconds) : String(format: "%d:%02d", minutes, seconds)
    }
}

// Goal Type enum
enum GoalType: String, Codable, CaseIterable {
    case general = "General Fitness"
    case race = "Race Training"
}

struct PlanPreferences {
    let targetWeeklyDistance: Double // meters
    let runningDaysPerWeek: Int
    let qualityWorkoutsPerWeek: Int
    let preferredLongRunDay: WeekDay
    let coachingStyle: CoachingStyle
}

enum WeekDay: String, CaseIterable {
    case monday = "Monday"
    case tuesday = "Tuesday"
    case wednesday = "Wednesday"
    case thursday = "Thursday"
    case friday = "Friday"
    case saturday = "Saturday"
    case sunday = "Sunday"
}

enum CoachingStyle: String, CaseIterable {
    case motivational = "Motivational"
    case authoritative = "Authoritative"
    case technical = "Technical"
    case dataDriven = "Data-Driven"
    case balanced = "Balanced"
}

struct PlanSummary {
    let durationWeeks: Int
    let totalDistance: Double // meters
    let avgWeeklyDistance: Double // meters
}

struct PlanWeek: Identifiable {
    let id = UUID()
    let weekNumber: Int
    let startDate: Date
    let endDate: Date
    let phase: TrainingPhase
    let totalDistance: Double // meters
    var completedDistance: Double? // meters
    let dailyWorkouts: [Workout]
    
    var isCurrentWeek: Bool {
        let now = Date()
        return now >= startDate && now <= endDate
    }
    
    var isPastWeek: Bool {
        return Date() > endDate
    }
    
    var isFutureWeek: Bool {
        return Date() < startDate
    }
    
    var completionPercentage: Double {
        guard let completed = completedDistance else { return 0 }
        return min(completed / totalDistance * 100, 100)
    }
}

enum TrainingPhase: String {
    case base = "Base Building"
    case build = "Building"
    case peak = "Peak"
    case taper = "Taper"
    case race = "Race Week"
}

// Workout model
struct Workout: Identifiable, Codable {
    let id: String
    let title: String
    let description: String
    let workoutType: WorkoutType
    var status: WorkoutStatus
    let date: Date
    let plannedDistance: Double // in meters
    let estimatedDuration: TimeInterval // in seconds
    let intensityLevel: IntensityLevel
    var completedActivity: Activity?
    
    // Mock data
    static let exampleWeek: [Workout] {
        let calendar = Calendar.current
        let today = Date()
        let startOfToday = calendar.startOfDay(for: today)
        
        // Create date components for this week
        let monday = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today))!
        let weekDates = (0...6).map { day in
            calendar.date(byAdding: .day, value: day, to: monday)!
        }
        
        return [
            // Monday - Easy Run
            Workout(
                id: "w1",
                title: "Easy Recovery Run",
                description: "Start the week with a gentle recovery run to flush out any fatigue from the weekend.",
                workoutType: .easy,
                status: calendar.isDateInToday(weekDates[0]) ? .scheduled : (weekDates[0] < today ? .completed : .scheduled),
                date: weekDates[0],
                plannedDistance: 5000, // 5km
                estimatedDuration: 1800, // 30min
                intensityLevel: .low,
                completedActivity: nil
            ),
            
            // Wednesday - Intervals
            Workout(
                id: "w2",
                title: "Interval Workout",
                description: "6 x 400m repeats with 200m recovery jogs. Target pace 10-15 sec/km faster than 5K pace.",
                workoutType: .interval,
                status: calendar.isDateInToday(weekDates[2]) ? .scheduled : (weekDates[2] < today ? .completed : .scheduled),
                date: weekDates[2],
                plannedDistance: 7000, // 7km with warmup/cooldown
                estimatedDuration: 2400, // 40min
                intensityLevel: .high,
                completedActivity: nil
            ),
            
            // Friday - Tempo Run
            Workout(
                id: "w3",
                title: "Tempo Run",
                description: "Warm up 10min, 20min at marathon pace, 10min cooldown.",
                workoutType: .tempo,
                status: calendar.isDateInToday(weekDates[4]) ? .scheduled : (weekDates[4] < today ? .completed : .scheduled),
                date: weekDates[4],
                plannedDistance: 8000, // 8km
                estimatedDuration: 2700, // 45min
                intensityLevel: .moderate,
                completedActivity: nil
            ),
            
            // Saturday - Easy Run
            Workout(
                id: "w4",
                title: "Easy Run",
                description: "Easy effort run with focus on good form. Keep the effort conversational.",
                workoutType: .easy,
                status: calendar.isDateInToday(weekDates[5]) ? .scheduled : (weekDates[5] < today ? .completed : .scheduled),
                date: weekDates[5],
                plannedDistance: 6000, // 6km
                estimatedDuration: 2100, // 35min
                intensityLevel: .low,
                completedActivity: nil
            ),
            
            // Sunday - Long Run
            Workout(
                id: "w5",
                title: "Long Run",
                description: "Weekly long run to build endurance. Keep the pace easy and focus on time on feet.",
                workoutType: .longRun,
                status: calendar.isDateInToday(weekDates[6]) ? .scheduled : (weekDates[6] < today ? .completed : .scheduled),
                date: weekDates[6],
                plannedDistance: 16000, // 16km
                estimatedDuration: 5400, // 90min
                intensityLevel: .moderate,
                completedActivity: nil
            )
        ]
    }
}

// Workout Type enum
enum WorkoutType: String, Codable, CaseIterable {
    case easy = "Easy Run"
    case tempo = "Tempo Run"
    case interval = "Interval"
    case longRun = "Long Run"
    case recovery = "Recovery"
    case fartlek = "Fartlek"
    case hillRepeats = "Hill Repeats"
    case rest = "Rest Day"
}

// Workout Status enum
enum WorkoutStatus: String, Codable, CaseIterable {
    case scheduled = "Scheduled"
    case completed = "Completed"
    case skipped = "Skipped"
    case missed = "Missed"
    case upcoming = "Upcoming"
}

// Intensity Level enum
enum IntensityLevel: String, Codable, CaseIterable {
    case veryLow = "Very Low"
    case low = "Low"
    case moderate = "Moderate"
    case high = "High"
    case veryHigh = "Very High"
}

struct PaceTarget {
    let minSecondsPerKm: Double
    let maxSecondsPerKm: Double
    
    var formattedRange: String {
        return "\(formatPace(minSecondsPerKm)) - \(formatPace(maxSecondsPerKm)) /km"
    }
    
    private func formatPace(_ secondsPerKm: Double) -> String {
        let minutes = Int(secondsPerKm) / 60
        let seconds = Int(secondsPerKm) % 60
        return String(format: "%d:%02d", minutes, seconds)
    }
}

struct WorkoutComponent: Identifiable {
    let id = UUID()
    let sequence: Int
    let type: ComponentType
    let description: String
    let distance: Double? // meters
    let duration: TimeInterval? // seconds
    let paceTarget: PaceTarget?
    let repeatCount: Int?
}

enum ComponentType: String {
    case warmUp = "Warm Up"
    case run = "Run"
    case recovery = "Recovery"
    case coolDown = "Cool Down"
}

struct WorkoutAlternative: Identifiable {
    let id = UUID()
    let description: String
    let reason: String
}

struct PlanCompletionStats {
    let overallCompletionPercent: Double
    let mileageCompletionPercent: Double
    let goalAchieved: Bool?
    let fitnessImprovementMetric: Double?
    let actualRaceTimeSeconds: TimeInterval?
}

// Activity models (for completed workouts/training log)
struct Activity: Identifiable, Codable {
    let id: String
    let userId: String
    let source: ActivitySource
    let sourceActivityId: String?
    let startTime: Date
    let name: String
    let description: String?
    let distance: Double // meters
    let movingTimeSeconds: TimeInterval
    let elapsedTimeSeconds: TimeInterval
    let averagePaceSecondsPerKm: Double
    let maxPaceSecondsPerKm: Double?
    let averageHeartRate: Double?
    let maxHeartRate: Double?
    let totalElevationGainMeters: Double?
    let mapThumbnailUrl: String?
    let hasPhotos: Bool
    let photos: [String]?
    let laps: [ActivityLap]?
    let isReconciled: Bool
    let reconciliationType: ReconciliationType?
    let reconciledWorkoutId: String?
    let perceivedEffort: Int?
    let journalEntry: String?
    
    // Computed properties for views
    var title: String {
        return name
    }
    
    var date: Date {
        return startTime
    }
    
    var duration: TimeInterval {
        return movingTimeSeconds
    }
    
    static var mockActivities: [Activity] {
        return MockActivities.shared.recentActivities
    }
    
    var formattedDistance: String {
        return String(format: "%.2f km", distance / 1000)
    }
    
    var formattedPace: String {
        let minutes = Int(averagePaceSecondsPerKm) / 60
        let seconds = Int(averagePaceSecondsPerKm) % 60
        return String(format: "%d:%02d /km", minutes, seconds)
    }
    
    var formattedDuration: String {
        let hours = Int(movingTimeSeconds) / 3600
        let minutes = (Int(movingTimeSeconds) % 3600) / 60
        let seconds = Int(movingTimeSeconds) % 60
        
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%d:%02d", minutes, seconds)
        }
    }
}

enum ActivitySource: String {
    case strava = "Strava"
    case manual = "Manual"
}

enum ReconciliationType: String {
    case yes = "Yes"
    case no = "No"
    case withModifications = "WithModifications"
    case auto = "Auto"
}

struct ActivityLap: Identifiable {
    let id = UUID()
    let lapNumber: Int
    let distance: Double // meters
    let startTime: Date
    let elapsedTimeSeconds: TimeInterval
    let movingTimeSeconds: TimeInterval
    let averagePaceSecondsPerKm: Double
    let averageHeartRate: Double?
    let splitType: SplitType
}

enum SplitType: String {
    case distance = "Distance"
    case manual = "Manual"
}

// ViciConversation model for "Ask Vici" views
struct ViciConversation: Identifiable {
    let id: String
    let question: String
    let answer: String
    let date: Date
    
    static var mockConversations: [ViciConversation] {
        return [
            ViciConversation(
                id: "1",
                question: "Should I adjust my long run this weekend? My legs feel tired.",
                answer: "Based on your recent training load and recovery metrics, I recommend reducing your planned 16km run to 12km at a very easy pace. Focus on recovery and listen to your body - this small adjustment will help prevent overtraining while maintaining your base fitness.",
                date: Date().addingTimeInterval(-2*24*60*60)
            ),
            ViciConversation(
                id: "2",
                question: "I missed my interval workout yesterday. How should I adjust my schedule?",
                answer: "Instead of trying to make up the missed intervals, I suggest continuing with your planned schedule. Add a few 30-second strides to the end of your next easy run to maintain some speed work. The consistency of your overall plan is more important than one missed workout.",
                date: Date().addingTimeInterval(-5*24*60*60)
            ),
            ViciConversation(
                id: "3",
                question: "What's the best way to prepare for my race in hot weather?",
                answer: "To prepare for your race in hot conditions, I recommend: 1) Do 2-3 training runs in the heat of the day to acclimatize, 2) Practice your hydration strategy during training, aiming for 500-750ml per hour, 3) Consider adjusting your pace expectations by 5-10% in very hot conditions, and 4) Pre-cool with cold towels or ice before the race start.",
                date: Date().addingTimeInterval(-10*24*60*60)
            )
        ]
    }
}

// Gamification models
struct Badge: Identifiable {
    let id: String
    let name: String
    let description: String
    let imageUrl: String
    let dateEarned: Date
    
    static var all: [Badge] {
        return MockBadges.badges
    }
}

// Helper function to generate mock weeks
func generateMockWeeks() -> [PlanWeek] {
    let today = Date()
    let calendar = Calendar.current
    
    // Starting 10 days ago
    var startDate = calendar.startOfDay(for: today.addingTimeInterval(-10*24*60*60))
    
    // Find the most recent Monday to align weeks
    while calendar.component(.weekday, from: startDate) != 2 { // 2 is Monday
        startDate = calendar.date(byAdding: .day, value: -1, to: startDate)!
    }
    
    var mockWeeks: [PlanWeek] = []
    
    for weekNum in 1...10 {
        let weekStartDate = calendar.date(byAdding: .weekOfYear, value: weekNum - 1, to: startDate)!
        let weekEndDate = calendar.date(byAdding: .day, value: 6, to: weekStartDate)!
        
        let isPast = weekEndDate < today
        let isCurrentWeek = weekStartDate <= today && weekEndDate >= today
        
        // Determine phase based on week number
        let phase: TrainingPhase
        if weekNum <= 3 {
            phase = .base
        } else if weekNum <= 7 {
            phase = .build
        } else if weekNum <= 9 {
            phase = .peak
        } else {
            phase = .taper
        }
        
        // Generate workouts for the week
        var dailyWorkouts: [Workout] = []
        let targetDistance = Double(35 + weekNum) * 1000 // Increasing weekly distance
        var weeklyDistance: Double = 0
        
        for dayOffset in 0...6 {
            let workoutDate = calendar.date(byAdding: .day, value: dayOffset, to: weekStartDate)!
            let dayOfWeek = calendar.component(.weekday, from: workoutDate)
            
            // Rest days on Monday and Friday (weekday 2 and 6)
            if dayOfWeek == 2 || dayOfWeek == 6 {
                dailyWorkouts.append(Workout(
                    id: UUID().uuidString,
                    title: "Rest day",
                    description: "Rest day",
                    workoutType: .rest,
                    status: isPast ? .completed : .upcoming,
                    date: workoutDate,
                    plannedDistance: 0,
                    estimatedDuration: 0,
                    intensityLevel: .low,
                    completedActivity: nil
                ))
                continue
            }
            
            // Different workout types for different days
            var workoutType: WorkoutType
            var description: String
            var purpose: String
            var distance: Double
            var paceTarget: PaceTarget?
            var components: [WorkoutComponent]?
            
            switch dayOfWeek {
            case 3: // Tuesday - Speed work
                workoutType = .interval
                description = "Interval Training: 6x800m"
                purpose = "Improve speed and VO2 max"
                distance = 8000
                paceTarget = PaceTarget(minSecondsPerKm: 240, maxSecondsPerKm: 270) // 4:00-4:30/km
                components = [
                    WorkoutComponent(sequence: 1, type: .warmUp, description: "Easy jog", distance: 2000, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360), repeatCount: nil),
                    WorkoutComponent(sequence: 2, type: .run, description: "800m hard effort", distance: 800, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 240, maxSecondsPerKm: 255), repeatCount: 6),
                    WorkoutComponent(sequence: 3, type: .recovery, description: "400m very easy jog or walk", distance: 400, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 360, maxSecondsPerKm: 420), repeatCount: 6),
                    WorkoutComponent(sequence: 4, type: .coolDown, description: "Easy jog", distance: 1000, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360), repeatCount: nil)
                ]
            case 4: // Wednesday - Easy run
                workoutType = .easy
                description = "Easy Recovery Run"
                purpose = "Active recovery while maintaining consistency"
                distance = 6000
                paceTarget = PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360) // 5:30-6:00/km
                components = nil
            case 5: // Thursday - Tempo
                workoutType = .tempo
                description = "Tempo Run"
                purpose = "Build lactate threshold and race pace endurance"
                distance = 10000
                paceTarget = PaceTarget(minSecondsPerKm: 285, maxSecondsPerKm: 315) // 4:45-5:15/km
                components = [
                    WorkoutComponent(sequence: 1, type: .warmUp, description: "Easy jog", distance: 2000, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360), repeatCount: nil),
                    WorkoutComponent(sequence: 2, type: .run, description: "Sustained tempo effort", distance: 6000, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 285, maxSecondsPerKm: 300), repeatCount: nil),
                    WorkoutComponent(sequence: 3, type: .coolDown, description: "Easy jog", distance: 2000, duration: nil, paceTarget: PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360), repeatCount: nil)
                ]
            case 7: // Saturday
                workoutType = .easy
                description = "Easy Run"
                purpose = "Maintain aerobic base while recovering for long run"
                distance = 8000
                paceTarget = PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360) // 5:30-6:00/km
                components = nil
            case 1: // Sunday - Long run
                workoutType = .longRun
                description = "Long Run"
                purpose = "Build endurance and aerobic capacity"
                distance = Double(14 + weekNum) * 1000 // Increasing long run distance
                paceTarget = PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 345) // 5:30-5:45/km
                components = nil
            default:
                workoutType = .easy
                description = "Easy Run"
                purpose = "Maintain consistency"
                distance = 5000
                paceTarget = PaceTarget(minSecondsPerKm: 330, maxSecondsPerKm: 360) // 5:30-6:00/km
                components = nil
            }
            
            weeklyDistance += distance
            
            // Set status based on date
            let status: WorkoutStatus
            var reconciledActivityId: String? = nil
            
            if workoutDate < today {
                // Past workout
                if Bool.random() && workoutType != .rest {
                    status = .completed
                    reconciledActivityId = UUID().uuidString
                } else if Bool.random() {
                    status = .missed
                } else {
                    status = .skipped
                }
            } else {
                status = .upcoming
            }
            
            dailyWorkouts.append(Workout(
                id: UUID().uuidString,
                title: description,
                description: purpose,
                workoutType: workoutType,
                status: status,
                date: workoutDate,
                plannedDistance: distance,
                estimatedDuration: distance / 1000 * (paceTarget?.minSecondsPerKm ?? 330), // Estimate duration
                intensityLevel: .moderate,
                completedActivity: nil
            ))
        }
        
        mockWeeks.append(PlanWeek(
            weekNumber: weekNum,
            startDate: weekStartDate,
            endDate: weekEndDate,
            phase: phase,
            totalDistance: weeklyDistance,
            completedDistance: isPast ? weeklyDistance * Double.random(in: 0.7...1.1) : (isCurrentWeek ? weeklyDistance * Double.random(in: 0.1...0.5) : nil),
            dailyWorkouts: dailyWorkouts
        ))
    }
    
    return mockWeeks
}

// Mock activities for training log
class MockActivities {
    static let shared = MockActivities()
    
    var recentActivities: [Activity] = []
    
    init() {
        generateMockActivities()
    }
    
    private func generateMockActivities() {
        // Generate activities for the past 30 days
        let calendar = Calendar.current
        let today = Date()
        
        for dayOffset in 0..<30 {
            let activityDate = calendar.date(byAdding: .day, value: -dayOffset, to: today)!
            
            // Skip some days to simulate not running every day
            if dayOffset % 5 == 3 || dayOffset % 7 == 6 {
                continue
            }
            
            // Create 1-2 activities per day
            let activitiesForDay = Int.random(in: 1...(dayOffset % 8 == 0 ? 2 : 1))
            
            for activityNum in 0..<activitiesForDay {
                // Adjust time to be later in the day for second activity
                var activityTime = activityDate
                if activityNum > 0 {
                    activityTime = calendar.date(byAdding: .hour, value: 8, to: activityTime)!
                }
                
                // Random distance between 5-20km
                let distance = Double.random(in: 5...20) * 1000
                
                // Random pace between 4:30-6:00/km
                let pace = Double.random(in: 270...360)
                
                // Calculate moving time based on distance and pace
                let movingTime = distance / 1000 * pace
                
                // Add some stopped time to elapsed time
                let elapsedTime = movingTime + Double.random(in: 0...300)
                
                // Generate some laps
                var laps: [ActivityLap] = []
                let kmLaps = Int(distance / 1000)
                var lapStartTime = activityTime
                
                for lap in 1...kmLaps {
                    let lapPace = pace + Double.random(in: -30...30) // Vary pace by ±30s
                    let lapTime = lapPace
                    
                    laps.append(ActivityLap(
                        lapNumber: lap,
                        distance: 1000,
                        startTime: lapStartTime,
                        elapsedTimeSeconds: lapTime,
                        movingTimeSeconds: lapTime,
                        averagePaceSecondsPerKm: lapPace,
                        averageHeartRate: Double.random(in: 140...180),
                        splitType: .distance
                    ))
                    
                    lapStartTime = calendar.date(byAdding: .second, value: Int(lapTime), to: lapStartTime)!
                }
                
                // Activity types based on day of week and distance
                let dayOfWeek = calendar.component(.weekday, from: activityDate)
                let workoutType: WorkoutType
                let name: String
                
                switch dayOfWeek {
                case 1: // Sunday
                    workoutType = distance > 15000 ? .longRun : .easy
                    name = distance > 15000 ? "Sunday Long Run" : "Sunday Easy Run"
                case 3: // Tuesday
                    workoutType = distance < 8000 ? .interval : .easy
                    name = distance < 8000 ? "Tuesday Speed Session" : "Tuesday Run"
                case 5: // Thursday
                    workoutType = distance > 8000 ? .tempo : .easy
                    name = distance > 8000 ? "Tempo Run" : "Thursday Easy Run"
                default:
                    workoutType = .easy
                    name = "Easy Run"
                }
                
                // Create the activity
                let activity = Activity(
                    id: UUID().uuidString,
                    userId: "user123",
                    source: .strava,
                    sourceActivityId: "strava_\(UUID().uuidString)",
                    startTime: activityTime,
                    name: name,
                    description: nil,
                    distance: distance,
                    movingTimeSeconds: movingTime,
                    elapsedTimeSeconds: elapsedTime,
                    averagePaceSecondsPerKm: pace,
                    maxPaceSecondsPerKm: pace - Double.random(in: 30...60),
                    averageHeartRate: Double.random(in: 140...175),
                    maxHeartRate: Double.random(in: 175...195),
                    totalElevationGainMeters: Double.random(in: 50...200),
                    mapThumbnailUrl: nil,
                    hasPhotos: Bool.random(),
                    photos: nil,
                    laps: laps,
                    isReconciled: dayOffset < 14 && Bool.random(), // Reconcile some older activities
                    reconciliationType: dayOffset < 14 && Bool.random() ? (Bool.random() ? .yes : .withModifications) : nil,
                    reconciledWorkoutId: dayOffset < 14 && Bool.random() ? UUID().uuidString : nil,
                    perceivedEffort: Int.random(in: 3...10),
                    journalEntry: Bool.random() ? "Felt \(["good", "great", "tired", "strong", "sluggish"].randomElement()!) today." : nil
                )
                
                recentActivities.append(activity)
            }
        }
        
        // Sort by date (newest first)
        recentActivities.sort { $0.startTime > $1.startTime }
    }
}

// Mock badges
struct MockBadges {
    static let badges: [Badge] = [
        Badge(
            id: "1",
            name: "First 5K",
            description: "Completed your first 5K run",
            imageUrl: "medal.fill",
            dateEarned: Date().addingTimeInterval(-60*24*60*60)
        ),
        Badge(
            id: "2",
            name: "Consistent Runner",
            description: "Completed all scheduled workouts for a week",
            imageUrl: "flame.fill",
            dateEarned: Date().addingTimeInterval(-30*24*60*60)
        ),
        Badge(
            id: "3",
            name: "Early Bird",
            description: "Completed 5 runs before 7am",
            imageUrl: "sunrise.fill",
            dateEarned: Date().addingTimeInterval(-15*24*60*60)
        ),
        Badge(
            id: "4",
            name: "10K Club",
            description: "Ran your first 10K",
            imageUrl: "trophy.fill",
            dateEarned: Date().addingTimeInterval(-45*24*60*60)
        )
    ]
}

// Mock data for development and testing
struct MockData {
    // Sample user data
    static let sampleUser = User(
        id: "user123",
        email: "user@example.com",
        name: "John Runner",
        profilePictureUrl: nil
    )
    
    // Sample workout data
    static let sampleWorkouts = [
        Workout(
            id: "workout1",
            title: "Easy Run",
            description: "A light recovery run to build endurance",
            workoutType: .easy,
            status: .scheduled,
            date: Date(),
            plannedDistance: 5000,
            estimatedDuration: 1800,
            intensityLevel: .low,
            completedActivity: nil
        ),
        Workout(
            id: "workout2",
            title: "Interval Training",
            description: "6 x 400m repeats with 200m recovery jogs",
            workoutType: .interval,
            status: .scheduled,
            date: Date().addingTimeInterval(86400),
            plannedDistance: 7000,
            estimatedDuration: 2400,
            intensityLevel: .high,
            completedActivity: nil
        )
    ]
    
    // Sample training plan
    static let sampleTrainingPlan = TrainingPlan(
        id: "plan123", 
        name: "5K Beginner Plan",
        description: "A 5K training plan for beginners",
        goalType: .race,
        distance: 5000,
        duration: 8,
        difficulty: .beginner,
        startDate: Date().addingTimeInterval(-7 * 86400),
        endDate: Date().addingTimeInterval(56 * 86400),
        currentWeek: 5,
        totalWeeks: 12,
        currentWeekWorkouts: sampleWorkouts,
        currentWeekDistance: 30000,
        notes: "Focus on building your base mileage this week. The tempo run on Friday is key - really try to dial in that marathon pace feeling.",
        objective: "Complete a 5K race in under 20 minutes"
    )
}

// Basic model definitions
struct User {
    let id: String
    let email: String
    let name: String?
    let profilePictureUrl: String?
}

struct Workout {
    let id: String
    let title: String
    let description: String
    let workoutType: WorkoutType
    let status: WorkoutStatus
    let date: Date
    let plannedDistance: Double
    let estimatedDuration: TimeInterval
    let intensityLevel: IntensityLevel
    let completedActivity: Activity?
}

struct TrainingPlan {
    let id: String
    let name: String
    let description: String
    let goalType: GoalType
    let distance: Double
    let duration: Int
    let difficulty: ExperienceLevel
    let startDate: Date
    let endDate: Date
    let currentWeek: Int
    let totalWeeks: Int
    let currentWeekWorkouts: [Workout]
    let currentWeekDistance: Double
    let notes: String?
    let objective: String?
} 