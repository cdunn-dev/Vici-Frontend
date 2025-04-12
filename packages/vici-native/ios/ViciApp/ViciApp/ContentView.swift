//
//  ContentView.swift
//  ViciApp
//
//  Created by Chris Dunn on 11/04/2025.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        VStack(spacing: 20) {
            Text("Welcome to Vici")
                .font(.largeTitle)
                .bold()
            
            Text("Your AI Running Coach")
                .font(.title2)
                .foregroundColor(.secondary)
            
            Spacer()
                .frame(height: 40)
            
            Text("This is a placeholder view.")
                .font(.body)
            
            Text("The app will navigate to either the Authentication or Main Tab view.")
                .font(.body)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
        }
        .padding()
    }
}

#Preview {
    ContentView()
}
