# frozen_string_literal: true

# One entry per matched jurisdiction.
# Fill pathways: [] with { energy_step_required:, zero_carbon_step_required: } pairs.
# Agents: only replace lines that still say pathways: [] — do not touch other entries.

JURISDICTION_STEP_REQUIREMENTS_SEED = [
  {
    name: "100 Mile House",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Abbotsford",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Alberni-Clayoquot",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Alert Bay",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Anmore",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Armstrong",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Ashcroft",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Barriere",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Belcarra",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Bowen Island",
    locality_type: "municipality",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Bulkley-Nechako",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Burnaby",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Burns Lake",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Cache Creek",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Campbell River",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Canal Flats",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Cariboo",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Castlegar",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Central Coast",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Central Kootenay",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Central Okanagan",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Central Saanich",
    locality_type: "corporation of the district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Chase",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Chetwynd",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Chilliwack",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Clearwater",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Clinton",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Coldstream",
    locality_type: "corporation of the district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Columbia Shuswap",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Colwood",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Comox",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Comox Valley",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 2 }]
  },
  {
    name: "Coquitlam",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Courtenay",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 1 }
    ]
  },
  {
    name: "Cowichan Valley",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Cranbrook",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Creston",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Cumberland",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Daajing Giids",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Dawson Creek",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Delta",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Duncan",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "East Kootenay",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Elkford",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Enderby",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Esquimalt",
    locality_type: "corporation of the township",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Fernie",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fort St. James",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fort St. John",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fraser Lake",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fraser Valley",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fraser-Fort George",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Fruitvale",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Gibsons",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Gold River",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Golden",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Grand Forks",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Granisle",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Greenwood",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Harrison Hot Springs",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Hazelton",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Highlands",
    locality_type: "district",
    pathways: [
      { energy_step_required: 5, zero_carbon_step_required: 3 },
      { energy_step_required: 5, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 3 }
    ]
  },
  {
    name: "Hope",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Houston",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Hudson's Hope",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Invermere",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kamloops",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kaslo",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kelowna",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kent",
    locality_type: "corporation of the district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Keremeos",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kimberley",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kitimat",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kitimat-Stikine",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Kootenay Boundary",
    locality_type: "regional district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Ladysmith",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Lake Country",
    locality_type: "district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Lake Cowichan",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Langford",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Langley",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Langley",
    locality_type: "corporation of the township",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 1 }
    ]
  },
  {
    name: "Lantzville",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Lillooet",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Lions Bay",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 3 }]
  },
  {
    name: "Logan Lake",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Lumby",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Lytton",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Mackenzie",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Maple Ridge",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Masset",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "McBride",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Merritt",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Metchosin",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Midway",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Mission",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Montrose",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Mount Waddington",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Nakusp",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Nanaimo",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Nanaimo",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Nelson",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 2 }
    ]
  },
  {
    name: "New Denver",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "New Hazelton",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "New Westminster",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 5, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "North Coast",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "North Cowichan",
    locality_type: "corporation of the district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "North Okanagan",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "North Saanich",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "North Vancouver",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 5, zero_carbon_step_required: 1 }
    ]
  },
  {
    name: "North Vancouver",
    locality_type: "corporation of the district",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 5, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Northern Rockies",
    locality_type: "regional municipality",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Oak Bay",
    locality_type: "corporation of the district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Okanagan-Similkameen",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Oliver",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Osoyoos",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Parksville",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Peace River",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Peachland",
    locality_type: "corporation of the district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Pemberton",
    locality_type: "village",
    pathways: [{ energy_step_required: 4, zero_carbon_step_required: 1 }]
  },
  {
    name: "Penticton",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Pitt Meadows",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Alberni",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Alice",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Coquitlam",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Edward",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Hardy",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port McNeill",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Port Moody",
    locality_type: "city",
    pathways: [{ energy_step_required: 4, zero_carbon_step_required: 4 }]
  },
  {
    name: "Pouce Coupe",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Powell River",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Prince George",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Prince Rupert",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Princeton",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "qathet",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Qualicum Beach",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Quesnel",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Radium Hot Springs",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Revelstoke",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Richmond",
    locality_type: "city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Rossland",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 4, zero_carbon_step_required: 1 }]
  },
  {
    name: "Saanich",
    locality_type: "corporation of the district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 3, zero_carbon_step_required: 3 }
    ]
  },
  {
    name: "Salmo",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Salmon Arm",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sayward",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sechelt",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sechelt Indian Government",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sicamous",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sidney",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Silverton",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Slocan",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sooke",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Spallumcheen",
    locality_type: "corporation of the township",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sparwood",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Squamish",
    locality_type: "district",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 4 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Squamish-Lillooet",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Stewart",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Strathcona",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Summerland",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sun Peaks",
    locality_type: "mountain resort municipality",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Sunshine Coast",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Surrey",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Tahsis",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Taylor",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Telkwa",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Terrace",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "The Capital",
    locality_type: "regional district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Thompson-Nicola",
    locality_type: "regional district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Tl'azt'en (TLAZ-den) Nation",
    locality_type: "first nation",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Tofino",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Trail",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Tumbler Ridge",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Ucluelet",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Valemount",
    locality_type: "village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Vancouver",
    locality_type: "city",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 4 },
      { energy_step_required: 3, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "Vanderhoof",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Vernon",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Victoria",
    locality_type: "corporation of the city",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 5, zero_carbon_step_required: 4 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 4, zero_carbon_step_required: 4 }
    ]
  },
  {
    name: "View Royal",
    locality_type: "town",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 4 }]
  },
  {
    name: "Warfield",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Wells",
    locality_type: "district",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "West Kelowna",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "West Vancouver",
    locality_type: "corporation of the district",
    pathways: [
      { energy_step_required: 3, zero_carbon_step_required: 1 },
      { energy_step_required: 3, zero_carbon_step_required: 2 },
      { energy_step_required: 3, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 4 },
      { energy_step_required: 4, zero_carbon_step_required: 1 },
      { energy_step_required: 4, zero_carbon_step_required: 2 },
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 5, zero_carbon_step_required: 1 }
    ]
  },
  {
    name: "Whistler",
    locality_type: "mountain resort municipality",
    pathways: [
      { energy_step_required: 4, zero_carbon_step_required: 3 },
      { energy_step_required: 3, zero_carbon_step_required: 3 }
    ]
  },
  {
    name: "White Rock",
    locality_type: "corporation of the city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Williams Lake",
    locality_type: "city",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  },
  {
    name: "Zeballos",
    locality_type: "corporation of the village",
    pathways: [{ energy_step_required: 3, zero_carbon_step_required: 1 }]
  }
].freeze
