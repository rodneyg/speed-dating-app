//
//  ContentView.swift
//  SpeedDatingDemo
//
//  Created by Rodney Gainous Jr on 3/19/25.
//

import SwiftUI
import MagicText

struct ContentView: View {
    @State private var shouldRefresh = true // Triggers initial load
    @State private var stateMessage = "Loading..." // Displays state feedback

    var body: some View {
        VStack {
            // Display the Speed Dating web app
            MagicText(shouldRefresh: $shouldRefresh, onStateChange: handleStateChange)
                .edgesIgnoringSafeArea(.all) // Full-screen WebView
            
            // Refresh button
            Button("Refresh") {
                shouldRefresh = true // Triggers reload
            }
            .padding()
            
            // State feedback
            Text(stateMessage)
                .padding()
        }
    }
    
    // Handle state changes from the SDK
    private func handleStateChange(state: MagicTextState) {
        switch state {
        case .loading:
            stateMessage = "Loading..."
        case .loaded:
            stateMessage = "Loaded successfully!"
        case .failed(let error):
            stateMessage = "Failed to load: \(error.localizedDescription)"
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

#Preview {
    ContentView()
}
