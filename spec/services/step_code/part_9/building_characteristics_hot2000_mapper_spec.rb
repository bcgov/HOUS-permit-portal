RSpec.describe StepCode::Part9::BuildingCharacteristicsHot2000Mapper do
  describe "#mappings" do
    let(:xml) { Nokogiri.XML(<<~XML) }
      <HouseFile>
        <House>
          <NaturalAirInfiltration>
            <Specifications>
              <BlowerTest airChangeRate="2" leakageArea="466.6729" />
            </Specifications>
          </NaturalAirInfiltration>
          <Ventilation>
            <WholeHouseVentilatorList>
              <Hrv supplyFlowrate="34.9241" efficiency1="78">
                <EquipmentInformation><Manufacturer>VanEE</Manufacturer></EquipmentInformation>
                <VentilatorType><English>HRV</English></VentilatorType>
              </Hrv>
            </WholeHouseVentilatorList>
          </Ventilation>
          <HeatingCooling>
            <Type1>
              <Furnace>
                <Equipment>
                  <EnergySource><English>Natural gas</English></EnergySource>
                  <EquipmentType><English>Condensing</English></EquipmentType>
                </Equipment>
                <Specifications efficiency="90" />
              </Furnace>
            </Type1>
            <Type2>
              <AirHeatPump>
                <Equipment>
                  <Type><English>Central split system</English></Type>
                  <Function><English>Heating/Cooling</English></Function>
                </Equipment>
                <Specifications>
                  <HeatingEfficiency isCop="false" value="9" />
                  <CoolingEfficiency isCop="false" value="16" />
                </Specifications>
              </AirHeatPump>
            </Type2>
          </HeatingCooling>
          <BaseLoads>
            <ElectricalUsage>
              <ClothesDryer>
                <EnergySource><English>Natural Gas</English></EnergySource>
              </ClothesDryer>
            </ElectricalUsage>
          </BaseLoads>
          <Components>
            <Ceiling>
              <Label>Attic</Label>
              <Construction><CeilingType rValue="8.8">R50 attic</CeilingType></Construction>
            </Ceiling>
            <Wall>
              <Label>Main wall</Label>
              <Construction><Type rValue="3.88">2x6 R24</Type></Construction>
              <Components>
                <Door rValue="0.98">
                  <Label>Entrance</Label>
                  <Construction><Type>Steel insulated</Type></Construction>
                  <Components>
                    <Window shgc="0.3">
                      <Label>Door glazing</Label>
                      <Construction><Type rValue="0.6666">U 1.5 glazed door</Type></Construction>
                    </Window>
                  </Components>
                </Door>
                <Window shgc="0.29">
                  <Label>Bedroom</Label>
                  <Construction><Type rValue="0.5">U 2 window</Type></Construction>
                </Window>
              </Components>
            </Wall>
            <Floor>
              <Label>Exposed floor</Label>
              <Construction><Type rValue="5.23">R30 floor</Type></Construction>
            </Floor>
            <Basement>
              <Label>Basement</Label>
              <Floor>
                <Construction>
                  <AddedToSlab rValue="2.11">Under slab insulation</AddedToSlab>
                </Construction>
              </Floor>
              <Wall>
                <Construction>
                  <InteriorAddedInsulation>
                    <Description>ICF wall</Description>
                    <Composite><Section rsi="3.7541" /></Composite>
                  </InteriorAddedInsulation>
                </Construction>
              </Wall>
              <Components>
                <FloorHeader>
                  <Label>Floor header</Label>
                  <Construction><Type rValue="4.7">R24 batt</Type></Construction>
                </FloorHeader>
              </Components>
            </Basement>
            <HotWater>
              <Primary>
                <EnergySource><English>Electricity</English></EnergySource>
                <TankType><English>Conserver tank</English></TankType>
                <EnergyFactor value="0.8974" />
              </Primary>
            </HotWater>
          </Components>
        </House>
      </HouseFile>
    XML

    subject(:mappings) { described_class.new(xml: xml).mappings }

    it "maps envelope components into summary lines" do
      expect(mappings[:roof_ceilings_lines]).to include(
        { details: "Attic - R50 attic", rsi: 8.8 }
      )
      expect(mappings[:above_grade_walls_lines]).to include(
        { details: "Main wall - 2x6 R24", rsi: 3.88 }
      )
      expect(mappings[:framings_lines]).to include(
        { details: "Floor header - R24 batt", rsi: 4.7 }
      )
      expect(mappings[:unheated_floors_lines]).to include(
        { details: "Exposed floor - R30 floor", rsi: 5.23 }
      )
      expect(mappings[:below_grade_walls_lines]).to include(
        { details: "Basement - ICF wall", rsi: 3.7541 }
      )
      expect(mappings[:slabs_lines]).to include(
        { details: "Basement - Under slab insulation", rsi: 2.11 }
      )
    end

    it "maps openings into window and door performance lines" do
      expect(mappings[:windows_glazed_doors]).to include(performance_type: :usi)
      expect(mappings.dig(:windows_glazed_doors, :lines)).to include(
        {
          details: "Door glazing - U 1.5 glazed door",
          performance_value: 1.5,
          shgc: 0.3
        },
        { details: "Bedroom - U 2 window", performance_value: 2.0, shgc: 0.29 }
      )
      expect(mappings[:doors_lines]).to include(
        {
          details: "Entrance - Steel insulated",
          performance_type: :rsi,
          performance_value: 0.98
        }
      )
    end

    it "maps mechanical, ventilation, airtightness, and fossil fuel data" do
      expect(mappings[:space_heating_cooling_lines]).to include(
        {
          details: "Furnace - Natural gas - Condensing",
          performance_type: :afue,
          performance_value: 90.0
        },
        {
          details: "Air heat pump - Central split system - Heating/Cooling",
          performance_type: :hspf,
          performance_value: 9.0
        },
        {
          details:
            "Air heat pump - Central split system - Heating/Cooling cooling",
          performance_type: :seer,
          performance_value: 16.0
        }
      )
      expect(mappings[:hot_water_lines]).to include(
        {
          details: "Domestic hot water - Electricity - Conserver tank",
          performance_type: :ef,
          performance_value: 0.8974
        }
      )
      expect(mappings[:ventilation_lines]).to include(
        { details: "HRV - VanEE", percent_eff: 78.0, liters_per_sec: 34.9241 }
      )
      expect(mappings[:airtightness]).to eq(
        details: "ACH @ 50 Pa: 2.0; Leakage area: 466.6729"
      )
      expect(mappings[:fossil_fuels]).to eq(
        presence: :yes,
        details: "Fossil fuel energy sources: Natural gas, Natural Gas"
      )
    end
  end
end
