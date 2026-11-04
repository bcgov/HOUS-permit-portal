# frozen_string_literal: true

# BCBC 2024 Table C-2, degree-days below 18°C.
#
# Each row is [table place, heating_degree_days, jurisdiction name, locality_type].
# A jurisdiction with one station is stored as location_name "General".
# Several stations on one jurisdiction keep the table place names.
#
# A station inside a municipality goes to that municipality, not its regional
# district. Regional districts only get stations in unincorporated communities.
# The table has one "Langley" and one "North Vancouver"; both same-named
# jurisdictions get that station. Places the table does not list are omitted.
module BcbcHeatingDegreeDays
  ROWS = [
    ["100 Mile House", 5030, "100 Mile House", "district"],
    ["Abbotsford", 2860, "Abbotsford", "city"],
    ["Agassiz", 2750, "Kent", "corporation of the district"], # District of Kent
    ["Alberni", 3100, "Port Alberni", "city"], # former Alberni townsite, amalgamated 1967
    ["Ashcroft", 3700, "Ashcroft", "corporation of the village"],
    ["Bamfield", 3080, "Alberni-Clayoquot", "regional district"],
    ["Beatton River", 6300, "Peace River", "regional district"],
    ["Bella Bella", 3180, "Central Coast", "regional district"],
    ["Bella Coola", 3560, "Central Coast", "regional district"],
    ["Burns Lake", 5450, "Burns Lake", "corporation of the village"],
    ["Cache Creek", 3700, "Cache Creek", "village"],
    ["Campbell River", 3000, "Campbell River", "city"],
    ["Carmi", 4750, "Kootenay Boundary", "regional district"],
    ["Castlegar", 3580, "Castlegar", "city"],
    ["Chetwynd", 5500, "Chetwynd", "district"],
    ["Chilliwack", 2780, "Chilliwack", "city"],
    ["Colwood (Colwood Corners)", 2900, "Colwood", "city"],
    ["Colwood (Royal Bay Village)", 2600, "Colwood", "city"],
    ["Colwood (Triangle Mountain)", 3300, "Colwood", "city"],
    ["Comox", 2930, "Comox", "town"],
    ["Courtenay", 2930, "Courtenay", "corporation of the city"],
    ["Cranbrook", 4400, "Cranbrook", "corporation of the city"],
    ["Crescent Valley", 3650, "Central Kootenay", "regional district"],
    ["Crofton", 2880, "North Cowichan", "corporation of the district"],
    ["Dawson Creek", 5900, "Dawson Creek", "corporation of the city"],
    ["Dease Lake", 6730, "Kitimat-Stikine", "regional district"], # Electoral Area F
    ["Dog Creek", 4800, "Cariboo", "regional district"],
    ["Duncan", 2980, "Duncan", "corporation of the city"],
    ["Elko", 4600, "East Kootenay", "regional district"],
    ["Fernie", 4750, "Fernie", "city"],
    ["Fort Nelson", 6710, "Northern Rockies", "regional municipality"],
    ["Fort St. John", 5750, "Fort St. John", "city"],
    ["Glacier", 5800, "Columbia Shuswap", "regional district"], # Rogers Pass
    ["Golden", 4750, "Golden", "town"],
    ["Gold River", 3230, "Gold River", "village"],
    ["Grand Forks", 3820, "Grand Forks", "corporation of the city"],
    ["Greenwood", 4100, "Greenwood", "corporation of the city"],
    ["Hope", 2820, "Hope", "district"],
    ["Jordan River", 2900, "The Capital", "regional district"],
    ["Kamloops", 3450, "Kamloops", "city"],
    ["Kaslo", 3830, "Kaslo", "village"],
    ["Kelowna", 3400, "Kelowna", "city"],
    ["Kimberley", 4650, "Kimberley", "city"],
    ["Kitimat Plant", 3750, "Kitimat", "district"],
    ["Kitimat Townsite", 3900, "Kitimat", "district"],
    ["Ladysmith", 2920, "Ladysmith", "town"],
    ["Langford", 2750, "Langford", "city"],
    ["Lillooet", 3400, "Lillooet", "district"],
    ["Lytton", 3300, "Lytton", "corporation of the village"],
    ["Mackenzie", 5550, "Mackenzie", "district"],
    ["Masset", 3700, "Masset", "village"],
    ["McBride", 4980, "McBride", "corporation of the village"],
    ["McLeod Lake", 5450, "Fraser-Fort George", "regional district"],
    ["Merritt", 3900, "Merritt", "city"],
    ["Mission City", 2850, "Mission", "city"],
    ["Montrose", 3600, "Montrose", "corporation of the village"],
    ["Nakusp", 3560, "Nakusp", "village"],
    ["Nanaimo", 2920, "Nanaimo", "city"], # not Nanaimo regional district
    ["Nelson", 3500, "Nelson", "corporation of the city"],
    ["Ocean Falls", 3400, "Central Coast", "regional district"],
    ["Oliver", 3400, "Oliver", "town"],
    ["Osoyoos", 3100, "Osoyoos", "town"],
    ["Parksville", 2990, "Parksville", "city"],
    ["Penticton", 3350, "Penticton", "corporation of the city"],
    ["Port Alberni", 3100, "Port Alberni", "city"],
    ["Port Alice", 3010, "Port Alice", "village"],
    ["Port Hardy", 3440, "Port Hardy", "district"],
    ["Port McNeill", 3410, "Port McNeill", "town"],
    ["Port Renfrew", 2900, "The Capital", "regional district"],
    ["Powell River", 3100, "Powell River", "city"], # not qathet
    ["Prince George", 4720, "Prince George", "city"],
    ["Prince Rupert", 3900, "Prince Rupert", "city"],
    ["Princeton", 4250, "Princeton", "town"],
    ["Qualicum Beach", 2990, "Qualicum Beach", "town"],
    ["Queen Charlotte City", 3520, "Daajing Giids", "village"], # renamed 2022
    ["Quesnel", 4650, "Quesnel", "city"],
    ["Revelstoke", 4000, "Revelstoke", "city"],
    ["Salmon Arm", 3650, "Salmon Arm", "city"],
    ["Sandspit", 3450, "North Coast", "regional district"],
    ["Sechelt", 2680, "Sechelt", "district"], # not Sechelt Indian Government
    ["Sidney", 2850, "Sidney", "town"],
    ["Smithers", 5040, "Smithers", "town"],
    ["Smith River", 7100, "Northern Rockies", "regional municipality"],
    ["Sooke", 2900, "Sooke", "district"],
    ["Squamish", 2950, "Squamish", "district"],
    ["Stewart", 4350, "Stewart", "district"],
    ["Tahsis", 3150, "Tahsis", "village"],
    ["Taylor", 5720, "Taylor", "district"],
    ["Terrace", 4150, "Terrace", "city"],
    ["Tofino", 3150, "Tofino", "district"],
    ["Trail", 3600, "Trail", "city"],
    ["Ucluelet", 3120, "Ucluelet", "district"],
    ["Burnaby (General)", 2735, "Burnaby", "city"],
    ["Burnaby (Simon Fraser Univ.)", 3100, "Burnaby", "city"],
    ["Cloverdale", 2700, "Surrey", "city"],
    ["Haney", 2840, "Maple Ridge", "city"],
    ["Ladner", 2600, "Delta", "city"],
    ["Langley", 2700, "Langley", "city"], # table does not split city and township
    ["Langley", 2700, "Langley", "corporation of the township"],
    ["New Westminster", 2800, "New Westminster", "corporation of the city"],
    ["North Vancouver", 2910, "North Vancouver", "corporation of the city"],
    ["North Vancouver", 2910, "North Vancouver", "corporation of the district"],
    ["Richmond", 2800, "Richmond", "city"],
    ["Surrey (88 Ave & 156 St.)", 2750, "Surrey", "city"],
    ["Vancouver (City Hall)", 2825, "Vancouver", "city"],
    ["Vancouver (Granville St. & 41st Ave)", 2925, "Vancouver", "city"],
    ["West Vancouver", 2950, "West Vancouver", "corporation of the district"],
    ["Vernon", 3600, "Vernon", "corporation of the city"],
    ["Victoria", 2650, "Victoria", "corporation of the city"],
    ["Victoria (Gonzales Hts)", 2700, "Victoria", "corporation of the city"],
    ["Victoria (Mt Tolmie)", 2700, "Saanich", "corporation of the district"], # hill is in Saanich
    ["Whistler", 4180, "Whistler", "mountain resort municipality"],
    ["White Rock", 2620, "White Rock", "corporation of the city"],
    ["Williams Lake", 4400, "Williams Lake", "city"],
    ["Youbou", 3050, "Cowichan Valley", "regional district"]
  ].freeze

  def self.import_rows
    ROWS
      .group_by { |_location, _hdd, name, locality_type| [name, locality_type] }
      .flat_map do |(name, locality_type), rows|
        rows.map do |location, hdd, _name, _locality_type|
          {
            location_name: (rows.one? ? "General" : location),
            heating_degree_days: hdd,
            name: name,
            locality_type: locality_type
          }
        end
      end
  end
end
