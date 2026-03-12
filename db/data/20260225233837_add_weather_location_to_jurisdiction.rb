# frozen_string_literal: true

class AddWeatherLocationToJurisdiction < ActiveRecord::Migration[7.2]
  # BCBC Appendix C — July 2.5% dry bulb design temperatures (°C)
  # Format: [jurisdiction_name, locality_type, weather_location_label, design_summer_temp_celsius]
  WEATHER_DATA = [
    # Metro Vancouver
    ["Vancouver", "city", "Vancouver Int'l A", 26.2],
    ["Burnaby", "city", "Vancouver Int'l A", 26.2],
    ["Richmond", "city", "Vancouver Int'l A", 26.2],
    ["Surrey", "city", "Surrey Kwantlen Park", 28.6],
    ["Delta", "city", "Vancouver Int'l A", 26.2],
    ["Coquitlam", "city", "Vancouver Int'l A", 26.2],
    ["Port Coquitlam", "corporation of the city", "Vancouver Int'l A", 26.2],
    ["Port Moody", "city", "Vancouver Int'l A", 26.2],
    ["New Westminster", "corporation of the city", "Vancouver Int'l A", 26.2],
    ["North Vancouver", "corporation of the city", "North Vancouver", 25.3],
    ["North Vancouver", "corporation of the district", "North Vancouver", 25.3],
    ["West Vancouver", "corporation of the district", "North Vancouver", 25.3],
    ["Langley", "city", "Langley", 29.0],
    ["Langley", "corporation of the township", "Langley", 29.0],
    ["Maple Ridge", "city", "Pitt Meadows", 28.3],
    ["Pitt Meadows", "city", "Pitt Meadows", 28.3],
    ["White Rock", "corporation of the city", "White Rock", 24.4],
    # Capital Region (Victoria)
    ["Victoria", "corporation of the city", "Victoria Int'l A", 25.8],
    ["Saanich", "corporation of the district", "Victoria Int'l A", 25.8],
    ["Oak Bay", "corporation of the district", "Victoria Int'l A", 25.8],
    ["Esquimalt", "corporation of the township", "Victoria Int'l A", 25.8],
    ["Langford", "city", "Victoria Int'l A", 25.8],
    ["Colwood", "city", "Victoria Int'l A", 25.8],
    ["Sidney", "town", "Victoria Int'l A", 25.8],
    [
      "Central Saanich",
      "corporation of the district",
      "Victoria Int'l A",
      25.8
    ],
    ["North Saanich", "district", "Victoria Int'l A", 25.8],
    ["Sooke", "district", "Victoria Int'l A", 25.8],
    ["View Royal", "town", "Victoria Int'l A", 25.8],
    # Fraser Valley
    ["Abbotsford", "city", "Abbotsford A", 30.1],
    ["Chilliwack", "city", "Chilliwack", 31.3],
    ["Mission", "city", "Abbotsford A", 30.1],
    ["Hope", "district", "Hope A", 31.6],
    # Central Okanagan
    ["Kelowna", "city", "Kelowna A", 33.0],
    ["West Kelowna", "city", "Kelowna A", 33.0],
    ["Lake Country", "district", "Kelowna A", 33.0],
    ["Peachland", "corporation of the district", "Kelowna A", 33.0],
    # North Okanagan
    ["Vernon", "corporation of the city", "Vernon", 32.4],
    ["Armstrong", "city", "Vernon", 32.4],
    # Thompson-Nicola
    ["Kamloops", "city", "Kamloops A", 35.5],
    ["Merritt", "city", "Merritt", 34.0],
    # Okanagan-Similkameen
    ["Penticton", "corporation of the city", "Penticton A", 33.3],
    ["Oliver", "town", "Oliver", 34.7],
    ["Osoyoos", "town", "Osoyoos", 35.1],
    ["Summerland", "corporation of the district", "Penticton A", 33.3],
    ["Princeton", "town", "Princeton A", 32.1],
    # Nanaimo region
    ["Nanaimo", "city", "Nanaimo A", 27.1],
    ["Parksville", "city", "Nanaimo A", 27.1],
    ["Qualicum Beach", "town", "Nanaimo A", 27.1],
    # Comox Valley
    ["Courtenay", "corporation of the city", "Comox A", 26.4],
    ["Comox", "town", "Comox A", 26.4],
    ["Campbell River", "city", "Campbell River A", 25.7],
    # Columbia Shuswap
    ["Salmon Arm", "city", "Salmon Arm", 31.2],
    ["Revelstoke", "city", "Revelstoke", 30.7],
    ["Golden", "town", "Golden A", 30.0],
    # Central Kootenay
    ["Nelson", "corporation of the city", "Nelson", 31.2],
    ["Castlegar", "city", "Castlegar", 32.5],
    ["Cranbrook", "corporation of the city", "Cranbrook A", 31.3],
    # Kootenay Boundary
    ["Trail", "city", "Trail", 33.0],
    ["Rossland", "corporation of the city", "Trail", 33.0],
    ["Grand Forks", "corporation of the city", "Grand Forks", 33.5],
    # Northern BC
    ["Prince George", "city", "Prince George A", 27.7],
    ["Prince Rupert", "city", "Prince Rupert A", 17.5],
    ["Terrace", "city", "Terrace A", 27.0],
    ["Kitimat", "district", "Kitimat", 25.4],
    ["Dawson Creek", "corporation of the city", "Dawson Creek A", 27.6],
    ["Fort St. John", "city", "Fort St. John A", 27.1],
    ["Williams Lake", "city", "Williams Lake A", 28.8],
    ["Quesnel", "city", "Quesnel A", 29.2],
    # Squamish-Lillooet
    ["Squamish", "district", "Squamish", 27.5],
    ["Whistler", "resort municipality", "Whistler", 26.0],
    ["Pemberton", "village", "Pemberton", 29.0],
    # Sunshine Coast
    ["Sechelt", "district", "Sechelt", 25.0],
    ["Gibsons", "town", "Sechelt", 25.0],
    # Cowichan Valley
    ["Duncan", "corporation of the city", "Duncan", 28.8],
    ["North Cowichan", "corporation of the district", "Duncan", 28.8],
    ["Ladysmith", "town", "Nanaimo A", 27.1],
    # Alberni
    ["Port Alberni", "city", "Port Alberni A", 28.7],
    ["Tofino", "district", "Tofino A", 19.3],
    ["Ucluelet", "district", "Tofino A", 19.3],
    # East Kootenay
    ["Fernie", "corporation of the city", "Fernie", 29.3],
    ["Kimberley", "city", "Cranbrook A", 31.3],
    ["Invermere", "district", "Invermere", 30.7],
    # Powell River
    ["Powell River", "city", "Powell River A", 24.8]
  ].freeze

  def up
    WEATHER_DATA.each do |name, locality_type, weather_location, design_temp|
      j = Jurisdiction.find_by(name: name, locality_type: locality_type)
      next unless j

      j.update!(
        weather_location: weather_location,
        design_summer_temp: design_temp
      )
    end
    OverheatingCode.reindex
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
