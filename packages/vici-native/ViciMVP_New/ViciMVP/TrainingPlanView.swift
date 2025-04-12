import SwiftUI

struct TrainingPlanView: View {
    var body: some View {
        VStack {
            Text("Training Plan")
                .font(.largeTitle)
                .padding()
            
            List {
                Section(header: Text("This Week")) {
                    ForEach(1...5, id: \.self) { day in
                        HStack {
                            VStack(alignment: .leading) {
                                Text("Day \(day)")
                                    .font(.headline)
                                Text("5K Run")
                                    .font(.subheadline)
                                    .foregroundColor(.secondary)
                            }
                            
                            Spacer()
                            
                            Text("30 min")
                        }
                        .padding(.vertical, 8)
                    }
                }
            }
            .listStyle(InsetGroupedListStyle())
        }
    }
}

struct TrainingPlanView_Previews: PreviewProvider {
    static var previews: some View {
        TrainingPlanView()
    }
} 