# frozen_string_literal: true

RSpec.describe StepCode::Compliance::CheckRequirements::Energy::TEDIAdjusted do
  before { StepCode::Part9::TEDIReferencesSeeder.seed! }

  def call(hdd:, step: 3, heated_floor_area:)
    described_class.call(hdd:, step:, heated_floor_area:)
  end

  it "interpolates Zone 5 with Small Home for floor area under 210 m²" do
    # 40 + (50-40)*(3500-3000)/1000 + 0.004*(3500-3000) = 47
    expect(call(hdd: 3500, heated_floor_area: 180)).to be_within(0.01).of(47)
  end

  it "interpolates Zone 5 without Small Home for floor area over 210 m²" do
    # 40 + (50-40)*(3500-3000)/1000 = 45
    expect(call(hdd: 3500, heated_floor_area: 250)).to be_within(0.01).of(45)
  end

  it "uses /500 from HDD 2500 and no Small Home in Zone 4" do
    # 30 + (40-30)*(2500-2500)/500 = 30
    expect(call(hdd: 2500, heated_floor_area: 180)).to be_within(0.01).of(30)
  end

  it "interpolates Zone 4 toward Zone 5 from the 2500 HDD baseline" do
    # 30 + (40-30)*(2900-2500)/500 = 38
    expect(call(hdd: 2900, heated_floor_area: 180)).to be_within(0.01).of(38)
  end

  it "applies Small Home at exactly 210 m² (DOCX: adj is 0 only when > 210)" do
    # 40 + (50-40)*(3500-3000)/1000 + 0.004*(3500-3000) = 47
    expect(call(hdd: 3500, heated_floor_area: 210)).to be_within(0.01).of(47)
  end

  it "freezes Zone 8 at the table TEDIstep with no Small Home when > 210 m²" do
    expect(call(hdd: 8000, heated_floor_area: 250)).to be_within(0.01).of(105)
  end

  it "freezes Zone 8 at the table TEDIstep plus Small Home when floor area ≤ 210 m²" do
    # 105 + 0.004*(8000-3000) = 125
    expect(call(hdd: 8000, heated_floor_area: 180)).to be_within(0.01).of(125)
  end
end
