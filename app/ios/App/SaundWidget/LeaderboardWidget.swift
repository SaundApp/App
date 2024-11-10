import WidgetKit
import SwiftUI

let sampleData = [
    LeaderboardArtist(id: "1", name: "One", username: "one", streams: 1500, avatarId: "a"),
    LeaderboardArtist(id: "2", name: "Two", username: "two", streams: 5000000, avatarId: "b"),
    LeaderboardArtist(id: "3", name: "Three", username: "three", streams: 2000000000, avatarId: "c")
]

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> LeaderboardEntry {
        LeaderboardEntry(date: Date(), artists: sampleData)
    }
    
    func getSnapshot(in context: Context, completion: @escaping (LeaderboardEntry) -> ()) {
        let entry = LeaderboardEntry(date: Date(), artists: sampleData)
        completion(entry)
    }
    
    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        var entries: [LeaderboardEntry] = []
        
        let sharedDefaults = UserDefaults(suiteName: "group.app.saund")
        var data: [LeaderboardArtist] = []
        
        if let json = sharedDefaults?.string(forKey: "leaderboard.artists") {
            if let decodedData = try? JSONDecoder().decode([LeaderboardArtist].self, from: Data(json.utf8)) {
                data = decodedData.map { artist in
                    var artistWithImage = artist
                    if let url = URL(string: "https://api.saund.app/attachments/" + artist.avatarId),
                       let imageData = try? Data(contentsOf: url) {
                        artistWithImage.avatarData = imageData
                    }
                    return artistWithImage
                }
            }
        }
        
        let currentDate = Date()
        let entryDate = Calendar.current.date(byAdding: .minute, value: 5, to: currentDate)!
        
        let entry = LeaderboardEntry(date: entryDate, artists: data)
        entries.append(entry)
        
        let timeline = Timeline(entries: entries, policy: .atEnd)
        completion(timeline)
    }
    
    
}

extension Int {
    var formattedWithAbbreviations: String {
        switch self {
        case 1_000_000_000...:
            return "\((self) / 1_000_000_000)B"
        case 1_000_000...:
            return "\((self) / 1_000_000)M"
        case 1_000...:
            return "\((self) / 1_000)K"
        default:
            return "\(self)"
        }
    }
}

struct LeaderboardArtist: Decodable, Hashable {
    let id: String
    let name: String
    let username: String
    let streams: Int
    let avatarId: String
    var avatarData: Data?
}

struct LeaderboardEntry: TimelineEntry {
    let date: Date
    let artists: [LeaderboardArtist]?
}

struct LeaderboardArtistView: View {
    var artist: LeaderboardArtist
    var index: Int
    
    var body: some View {
        let artistName = artist.name
        let artistStreams = artist.streams.formattedWithAbbreviations
        let emoji = if index == 1 {
            "🥇"
        } else if index == 2 {
            "🥈"
        } else if index == 3 {
            "🥉"
        } else {
            ""
        }
        
        VStack {
            ZStack(alignment: .bottomTrailing) {
                if let imageData = artist.avatarData, let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .frame(width: 50, height: 50)
                        .clipShape(Circle())
                } else {
                    Color.red
                        .frame(width: 50, height: 50)
                        .clipShape(Circle())
                }
                
                if !emoji.isEmpty {
                    Text(emoji)
                        .font(.system(size: 18))
                        .padding(4)
                        .clipShape(Circle())
                        .offset(x: -8, y: 2)
                }
            }
            
            Text(artistName)
            Text(artistStreams + " streams")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)
        }
    }
}

struct LeaderboardWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var widgetFamily
    
    var body: some View {
        let artistsToDisplay = entry.artists?.prefix(3) ?? []
        
        if entry.artists == nil {
            Text("Open the app to load data.")
        } else {
            if widgetFamily == .systemSmall,
               let firstArtist = artistsToDisplay.first {
                VStack {
                    Text("Top Artist")
                        .font(.headline)
                    
                    LeaderboardArtistView(artist: firstArtist, index: 1)
                }
            } else {
                VStack(alignment: .leading, spacing: 0) {
                    Text("Top Artists")
                        .font(.headline)
                        .padding([.bottom], 10)
                    
                    HStack {
                        Spacer()
                        ForEach(Array(artistsToDisplay.enumerated()), id: \.element.id) { index, artist in
                            LeaderboardArtistView(artist: artist, index: index + 1)
                        }
                        Spacer()
                    }
                }
            }
        }
    }
}


struct LeaderboardWidget: Widget {
    let kind: String = "LeaderboardWidget"
    
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            if #available(iOS 17.0, *) {
                LeaderboardWidgetEntryView(entry: entry)
                    .containerBackground(.fill.tertiary, for: .widget)
            } else {
                LeaderboardWidgetEntryView(entry: entry)
                    .padding()
                    .background()
            }
        }
        .configurationDisplayName("Leaderboard")
        .description("Display the montly leaderboard")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

struct LeaderboardWidget_Previews: PreviewProvider {
    static var previews: some View {
        let entry = LeaderboardEntry(date: Date(), artists: sampleData)
        
        return Group {
            LeaderboardWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemSmall))
                .containerBackground(.fill.tertiary, for: .widget)
            
            LeaderboardWidgetEntryView(entry: entry)
                .previewContext(WidgetPreviewContext(family: .systemMedium))
                .containerBackground(.fill.tertiary, for: .widget)
        }
    }
}
