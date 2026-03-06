RSpec.describe StepCode::Part9::DataEntryHot2000Mapper do
  describe "#mappings" do
    let(:xml) { Nokogiri.XML(<<~XML) }
        <HouseFile>
          <Application>
            <Name>HOT2000</Name>
            <Version><Labels><English>11.0</English></Labels></Version>
          </Application>
          <ProgramInformation>
            <File><Identification>P-100</Identification></File>
            <Weather heatingDegreeDay="4180"><Location><English>Vancouver</English></Location></Weather>
          </ProgramInformation>
          <Program>
            <Results>
              <Tsv>
                <NumDwellingUnits value="2" />
                <NLA value="1.23" />
                <EGHFconTotal value="20000" />
              </Tsv>
              <RefHse><theHouseFDWR value="0.35" /></RefHse>
            </Results>
          </Program>
          <House>
            <Specifications><HeatedFloorArea aboveGrade="100" belowGrade="20" /></Specifications>
            <NaturalAirInfiltration>
              <Specifications>
                <BlowerTest airChangeRate="2.1" />
                <House volume="250.6" />
              </Specifications>
            </NaturalAirInfiltration>
            <HeatingCooling>
              <Type1>
                <Furnace><Equipment><EnergySource code="1" /></Equipment></Furnace>
                <Boiler><Equipment><EnergySource code="2" /></Equipment></Boiler>
                <ComboHeatDhw><Equipment><EnergySource code="3" /></Equipment></ComboHeatDhw>
              </Type1>
              <Type2>
                <AirConditioning><Specifications><RatedCapacity value="3.2" /></Specifications></AirConditioning>
                <AirHeatPump><Specifications><OutputCapacity value="4.2" /></Specifications></AirHeatPump>
                <GroundHeatPump><Specifications><OutputCapacity value="5.2" /></Specifications></GroundHeatPump>
                <WaterHeatPump><Specifications><OutputCapacity value="6.2" /></Specifications></WaterHeatPump>
              </Type2>
            </HeatingCooling>
            <Components><HotWater><Primary><EnergySource code="4" /></Primary></HotWater></Components>
            <BaseLoads>
              <ElectricalUsage>
                <Stove><EnergySource code="5" /></Stove>
                <ClothesDryer><EnergySource code="6" /></ClothesDryer>
              </ElectricalUsage>
            </BaseLoads>
          </House>
          <AllResults>
            <Results houseCode="Reference">
              <Annual>
                <Consumption total="25.5">
                  <Electrical baseload="1.5" />
                </Consumption>
                <Load grossHeating="11.1" auxiliaryEnergy="22.2" />
              </Annual>
            </Results>
            <Results houseCode="SOC">
              <Annual>
                <Consumption>
                  <Electrical total="12.0" />
                  <NaturalGas total="7.0" />
                  <Propane total="8.0" />
                </Consumption>
                <Load grossHeating="10.1" auxiliaryEnergy="20.2" />
              </Annual>
              <Monthly>
                <ElectricalConsumption>
                  <Gross january="1" february="0" march="0" april="0" may="0" june="0" july="0" august="0" september="0" october="0" november="0" december="0" />
                </ElectricalConsumption>
              </Monthly>
            </Results>
            <Results>
              <Other designCoolLossRate="9.87" GrossArea buildingSurfaceArea="500.5" />
            </Results>
          </AllResults>
        </HouseFile>
      XML

    it "maps expected HOT2000 fields" do
      mappings = described_class.new(xml: xml).mappings

      expect(mappings[:model]).to eq("HOT2000")
      expect(mappings[:version]).to eq("11.0")
      expect(mappings[:hdd]).to eq(4180)
      expect(mappings[:aec]).to eq(20.0)
      expect(mappings[:ref_aec]).to eq(25.5)
      expect(mappings[:ach]).to eq(2.1)
      expect(mappings[:nla]).to eq(1.23)
      expect(mappings[:electrical_consumption]).to eq(1.0)
      expect(mappings[:natural_gas_consumption]).to eq(7.0)
      expect(mappings[:propane_consumption]).to eq(8.0)
    end
  end
end
