# frozen_string_literal: true

require "rails_helper"

# Production pluck of name + locality_type used to build the Table C-2 match.
# An assignment whose pair is not in this list is a typo and will not find a row.
PRODUCTION_JURISDICTIONS = [
  %w[Kamloops city],
  ["The Capital", "regional district"],
  ["Port Hardy", "district"],
  ["Bulkley-Nechako", "regional district"],
  ["Fraser Valley", "regional district"],
  ["East Kootenay", "regional district"],
  ["North Cowichan", "corporation of the district"],
  ["Penticton", "corporation of the city"],
  %w[Vanderhoof district],
  %w[Metchosin district],
  ["Central Kootenay", "regional district"],
  ["Maple Ridge", "city"],
  %w[Princeton town],
  %w[Sparwood district],
  ["Lake Country", "district"],
  ["Tŝideldel (tsigh-dell-dell) First Nation (Alexis Creek)", "first nation"],
  ["Qualicum Beach", "town"],
  %w[Stewart district],
  %w[Terrace city],
  ["Kent", "corporation of the district"],
  ["New Hazelton", "district"],
  ["Metro Vancouver", "regional district"],
  %w[Hope district],
  %w[Parksville city],
  ["Gitsegukla (Git-zee-gee-u-kla) First Nation", "first nation"],
  ["Oasis", "resort municipality"],
  ["Port Clements", "village"],
  ["Sunshine Coast", "regional district"],
  %w[Kaslo village],
  ["Dawson Creek", "corporation of the city"],
  ["Port Moody", "city"],
  ["Grand Forks", "corporation of the city"],
  ["Salmon Arm", "city"],
  ["Gold River", "village"],
  %w[Clearwater district],
  ["Fort St. John", "city"],
  ["Greenwood", "corporation of the city"],
  ["Lytton", "corporation of the village"],
  %w[Tahsis village],
  ["Montrose", "corporation of the village"],
  ["New Denver", "corporation of the village"],
  %w[Trail city],
  ["Oak Bay", "corporation of the district"],
  ["Port Coquitlam", "corporation of the city"],
  %w[Granisle village],
  ["Fraser Lake", "village"],
  ["Salmo", "corporation of the village"],
  ["Silverton", "corporation of the village"],
  ["West Vancouver", "corporation of the district"],
  %w[Comox town],
  ["Vernon", "corporation of the city"],
  %w[Golden town],
  ["Courtenay", "corporation of the city"],
  ["White Rock", "corporation of the city"],
  ["Tl'azt'en (TLAZ-den) Nation", "first nation"],
  ["Fraser-Fort George", "regional district"],
  %w[Kitimat district],
  %w[Wells district],
  ["Kootenay Boundary", "regional district"],
  %w[Langley city],
  ["Mount Waddington", "regional district"],
  ["Nanaimo", "regional district"],
  ["Victoria", "corporation of the city"],
  ["Yekooche (Ye-KOO-chay) First Nation", "first nation"],
  ["Ulkatcho (ul-kat-cho) First Nation", "first nation"],
  ["View Royal", "town"],
  %w[Surrey city],
  ["North Okanagan", "regional district"],
  ["Lumby", "corporation of the village"],
  ["Sechelt Indian Government", "district"],
  ["Ashcroft", "corporation of the village"],
  ["Enderby", "corporation of the city"],
  ["Warfield", "corporation of the village"],
  %w[Langford city],
  ["North Vancouver", "corporation of the city"],
  %w[Summerland district],
  %w[Nakusp village],
  ["Cache Creek", "village"],
  %w[Valemount village],
  %w[Abbotsford city],
  %w[Revelstoke city],
  ["Powell River", "city"],
  %w[Osoyoos town],
  %w[Merritt city],
  ["Hudson's Hope", "district"],
  %w[Smithers town],
  ["Alert Bay", "corporation of the village"],
  ["Bowen Island", "municipality"],
  %w[Kimberley city],
  %w[Barriere district],
  %w[Clinton village],
  ["Port Edward", "district"],
  %w[Chetwynd district],
  %w[Vancouver city],
  ["Logan Lake", "district"],
  ["Saanich", "corporation of the district"],
  ["100 Mile House", "district"],
  ["Fruitvale", "corporation of the village"],
  %w[Ladysmith town],
  ["Okanagan-Similkameen", "regional district"],
  %w[Burnaby city],
  %w[Chase village],
  ["North Vancouver", "corporation of the district"],
  ["Telkwa", "corporation of the village"],
  ["Columbia Shuswap", "regional district"],
  %w[Ucluelet district],
  ["Peace River", "regional district"],
  ["Cowichan Valley", "regional district"],
  %w[Richmond city],
  %w[Mackenzie district],
  ["Harrison Hot Springs", "village"],
  ["Esquimalt", "corporation of the township"],
  ["Strathcona", "regional district"],
  %w[Armstrong city],
  ["Squamish-Lillooet", "regional district"],
  ["Thompson-Nicola", "regional district"],
  ["Pouce Coupe", "corporation of the village"],
  %w[Lantzville district],
  %w[Elkford district],
  %w[Midway village],
  ["Radium Hot Springs", "village"],
  %w[Kelowna city],
  ["Tumbler Ridge", "district"],
  ["Whistler", "mountain resort municipality"],
  %w[Nanaimo city],
  %w[Sayward village],
  %w[Sidney town],
  ["Burns Lake", "corporation of the village"],
  ["Hazelton", "corporation of the village"],
  ["Keremeos", "corporation of the village"],
  %w[Pemberton village],
  %w[Gibsons town],
  ["Port Alice", "village"],
  ["Alberni-Clayoquot", "regional district"],
  ["Central Saanich", "corporation of the district"],
  ["McBride", "corporation of the village"],
  ["Spallumcheen", "corporation of the township"],
  %w[Delta city],
  ["Musqueam Indian Band (X’Muzk’I’Um)", "first nation"],
  ["Tsleil-Waututh (tSLAY-way-tooth) səlilwətaɬ", "first nation"],
  %w[Sooke district],
  %w[Chilliwack city],
  %w[Fernie city],
  ["Campbell River", "city"],
  %w[Slocan village],
  ["Canal Flats", "village"],
  %w[Mission city],
  ["West Kelowna", "city"],
  ["Prince Rupert", "city"],
  ["Williams Lake", "city"],
  %w[Sechelt district],
  ["Port McNeill", "town"],
  ["Central Coast", "regional district"],
  ["Duncan", "corporation of the city"],
  ["Langley", "corporation of the township"],
  ["Peachland", "corporation of the district"],
  ["Central Okanagan", "regional district"],
  ["North Coast", "regional district"],
  %w[Coquitlam city],
  %w[Squamish district],
  %w[Tofino district],
  ["Lions Bay", "village"],
  %w[Masset village],
  ["Cariboo", "regional district"],
  %w[Taylor district],
  %w[Colwood city],
  %w[Castlegar city],
  ["Port Alberni", "city"],
  %w[Anmore village],
  %w[Houston district],
  ["Nelson", "corporation of the city"],
  ["New Westminster", "corporation of the city"],
  ["qathet", "regional district"],
  ["Kitimat-Stikine", "regional district"],
  %w[Quesnel city],
  ["Fort St. James", "district"],
  %w[Belcarra village],
  ["Cranbrook", "corporation of the city"],
  ["Cumberland", "corporation of the village"],
  ["Rossland", "corporation of the city"],
  %w[Highlands district],
  ["Zeballos", "corporation of the village"],
  %w[Lillooet district],
  ["Lake Cowichan", "town"],
  %w[Creston town],
  ["Daajing Giids", "village"],
  ["Prince George", "city"],
  %w[Sicamous district],
  ["Coldstream", "corporation of the district"],
  ["Northern Rockies", "regional municipality"],
  ["Sun Peaks", "mountain resort municipality"],
  ["Pitt Meadows", "city"],
  %w[Oliver town],
  ["North Saanich", "district"],
  ["Comox Valley", "regional district"],
  %w[Invermere district]
].freeze

RSpec.describe BcbcHeatingDegreeDays do
  def targets
    described_class::ROWS.map do |_location, _hdd, name, locality_type|
      [name, locality_type]
    end
  end

  def rows_for(name, locality_type)
    described_class::ROWS.select do |_location, _hdd, row_name, row_type|
      row_name == name && row_type == locality_type
    end
  end

  it "only targets jurisdictions from the production snapshot" do
    expect(targets - PRODUCTION_JURISDICTIONS).to eq([])
  end

  it "keeps one location name per jurisdiction" do
    groups =
      described_class::ROWS.group_by do |location, _hdd, name, locality_type|
        [name, locality_type, location.downcase]
      end

    expect(groups.values.map(&:size).uniq).to eq([1])
  end

  it "repeats a table location only when two jurisdictions share that name" do
    repeated =
      described_class::ROWS
        .group_by(&:first)
        .select { |_location, rows| rows.size > 1 }
        .transform_values do |rows|
          rows.map do |_location, hdd, name, locality_type|
            [hdd, name, locality_type]
          end
        end

    expect(repeated).to eq(
      "Langley" => [
        [2700, "Langley", "city"],
        [2700, "Langley", "corporation of the township"]
      ],
      "North Vancouver" => [
        [2910, "North Vancouver", "corporation of the city"],
        [2910, "North Vancouver", "corporation of the district"]
      ]
    )
  end

  it "puts several table stations on one jurisdiction under their own location names" do
    expect(
      rows_for("Colwood", "city").map { |location, hdd, _, _| [location, hdd] }
    ).to eq(
      [
        ["Colwood (Colwood Corners)", 2900],
        ["Colwood (Royal Bay Village)", 2600],
        ["Colwood (Triangle Mountain)", 3300]
      ]
    )
    expect(rows_for("Surrey", "city").map(&:first)).to eq(
      ["Cloverdale", "Surrey (88 Ave & 156 St.)"]
    )
    expect(
      rows_for("Port Alberni", "city").map do |location, hdd, _, _|
        [location, hdd]
      end
    ).to eq([["Alberni", 3100], ["Port Alberni", 3100]])
    expect(
      rows_for("Northern Rockies", "regional municipality").map(&:first)
    ).to eq(["Fort Nelson", "Smith River"])
  end

  it "does not give a municipality station to the surrounding regional district" do
    expect(rows_for("Nanaimo", "regional district")).to eq([])
    expect(rows_for("Nanaimo", "city").map { |_, hdd, _, _| hdd }).to eq([2920])
    expect(rows_for("qathet", "regional district")).to eq([])
    expect(rows_for("Powell River", "city").map { |_, hdd, _, _| hdd }).to eq(
      [3100]
    )
    expect(rows_for("Sechelt Indian Government", "district")).to eq([])
    expect(targets.map(&:last)).not_to include("first nation")
  end

  it "stores General when the jurisdiction has one station" do
    stored = described_class.import_rows
    singles =
      stored
        .group_by { |row| [row[:name], row[:locality_type]] }
        .select { |_key, rows| rows.one? }

    expect(singles.values.flatten.map { |row| row[:location_name] }.uniq).to eq(
      ["General"]
    )
    powell_river = stored.find { |row| row[:name] == "Powell River" }
    expect(powell_river[:location_name]).to eq("General")
    expect(powell_river[:heating_degree_days]).to eq(3100)
    expect(stored.find { |row| row[:name] == "Grand Forks" }).to include(
      location_name: "General",
      heating_degree_days: 3820
    )
  end

  it "keeps table place names when the jurisdiction has several stations" do
    colwood =
      described_class
        .import_rows
        .select { |row| row[:name] == "Colwood" }
        .map { |row| [row[:location_name], row[:heating_degree_days]] }

    expect(colwood).to eq(
      [
        ["Colwood (Colwood Corners)", 2900],
        ["Colwood (Royal Bay Village)", 2600],
        ["Colwood (Triangle Mountain)", 3300]
      ]
    )
  end

  it "sends renamed and contained communities to the current jurisdiction" do
    expect(rows_for("Daajing Giids", "village").map(&:first)).to eq(
      ["Queen Charlotte City"]
    )
    expect(rows_for("Kent", "corporation of the district").map(&:first)).to eq(
      ["Agassiz"]
    )
    expect(rows_for("Maple Ridge", "city").map(&:first)).to eq(["Haney"])
    expect(rows_for("Delta", "city").map(&:first)).to eq(["Ladner"])
    expect(
      rows_for("North Cowichan", "corporation of the district").map(&:first)
    ).to eq(["Crofton"])
    expect(
      rows_for("Saanich", "corporation of the district").map(&:first)
    ).to eq(["Victoria (Mt Tolmie)"])
    expect(rows_for("The Capital", "regional district").map(&:first)).to eq(
      ["Jordan River", "Port Renfrew"]
    )
  end
end
