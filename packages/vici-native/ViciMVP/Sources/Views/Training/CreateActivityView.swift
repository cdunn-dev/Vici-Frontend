import SwiftUI

struct CreateActivityView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var activityName = ""
    @State private var activityDescription = ""
    @State private var selectedType: ActivityType = .run
    @State private var startDate = Date()
    @State private var duration: TimeInterval = 30 * 60 // 30 minutes
    @State private var distance = 5.0 // km
    @State private var calories: Int? = 300
    @State private var heartRate: Int? = 140
    @State private var elevationGain: Double? = 20
    @State private var weatherCondition: Weather.Condition = .clear
    @State private var temperatureCelsius = 18.0
    
    // Computed property for hours, minutes, seconds components
    private var durationComponents: (hours: Int, minutes: Int, seconds: Int) {
        let hours = Int(duration) / 3600
        let minutes = (Int(duration) % 3600) / 60
        let seconds = Int(duration) % 60
        return (hours, minutes, seconds)
    }
    
    // State variables for duration components
    @State private var hours = 0
    @State private var minutes = 30
    @State private var seconds = 0
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Activity Details")) {
                    TextField("Activity Name", text: $activityName)
                    
                    TextField("Description (optional)", text: $activityDescription)
                        .frame(height: 80)
                    
                    Picker("Activity Type", selection: $selectedType) {
                        ForEach(ActivityType.allCases, id: \.self) { type in
                            HStack {
                                Image(systemName: type.icon)
                                Text(String(describing: type).capitalized)
                            }
                            .tag(type)
                        }
                    }
                    
                    DatePicker("Date & Time", selection: $startDate)
                }
                
                Section(header: Text("Stats")) {
                    HStack {
                        Text("Duration")
                        Spacer()
                        HStack {
                            Picker("Hours", selection: $hours) {
                                ForEach(0..<24) { hour in
                                    Text("\(hour)h").tag(hour)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                            
                            Picker("Minutes", selection: $minutes) {
                                ForEach(0..<60) { minute in
                                    Text("\(minute)m").tag(minute)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                            
                            Picker("Seconds", selection: $seconds) {
                                ForEach(0..<60) { second in
                                    Text("\(second)s").tag(second)
                                }
                            }
                            .pickerStyle(.menu)
                            .labelsHidden()
                        }
                    }
                    
                    HStack {
                        Text("Distance")
                        Spacer()
                        TextField("", value: $distance, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("km")
                    }
                    
                    HStack {
                        Text("Calories")
                        Spacer()
                        TextField("", value: $calories, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("kcal")
                    }
                    
                    HStack {
                        Text("Heart Rate (avg)")
                        Spacer()
                        TextField("", value: $heartRate, format: .number)
                            .keyboardType(.numberPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("bpm")
                    }
                    
                    HStack {
                        Text("Elevation Gain")
                        Spacer()
                        TextField("", value: $elevationGain, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("m")
                    }
                }
                
                Section(header: Text("Weather")) {
                    Picker("Condition", selection: $weatherCondition) {
                        ForEach(Weather.Condition.allCases, id: \.self) { condition in
                            Text(String(describing: condition).capitalized)
                                .tag(condition)
                        }
                    }
                    
                    HStack {
                        Text("Temperature")
                        Spacer()
                        TextField("", value: $temperatureCelsius, format: .number)
                            .keyboardType(.decimalPad)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 60)
                        Text("°C")
                    }
                }
                
                Section {
                    Button(action: saveActivity) {
                        Text("Save Activity")
                            .frame(maxWidth: .infinity)
                            .foregroundColor(.white)
                            .padding()
                            .background(activityName.isEmpty ? Color.gray : Color.blue)
                            .cornerRadius(10)
                    }
                    .disabled(activityName.isEmpty)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
            }
            .navigationTitle("New Activity")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                // Initialize duration components from the duration property
                hours = durationComponents.hours
                minutes = durationComponents.minutes
                seconds = durationComponents.seconds
            }
        }
    }
    
    private func saveActivity() {
        // Calculate the duration from components
        duration = TimeInterval(hours * 3600 + minutes * 60 + seconds)
        
        // Create the weather object if temperature is set
        let weather = Weather(
            condition: weatherCondition,
            temperatureCelsius: temperatureCelsius
        )
        
        // Create the new activity
        let newActivity = Activity(
            id: UUID().uuidString,
            name: activityName,
            description: activityDescription.isEmpty ? nil : activityDescription,
            activityType: selectedType,
            startTime: startDate,
            movingTimeSeconds: Int(duration),
            distance: distance * 1000, // Convert km to meters
            calories: calories,
            elevationGain: elevationGain,
            averageHeartRate: heartRate,
            weather: weather
        )
        
        // Here you would typically save the activity to your data store
        // For now, we'll just dismiss the view
        dismiss()
    }
}

struct CreateActivityView_Previews: PreviewProvider {
    static var previews: some View {
        CreateActivityView()
    }
} 