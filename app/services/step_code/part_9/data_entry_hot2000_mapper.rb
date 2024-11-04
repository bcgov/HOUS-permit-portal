class StepCode::Part9::DataEntryHot2000Mapper
  attr_reader :xml

  def initialize(xml:)
    @xml = xml
  end

  def mapped_attributes
    %i[
      stage
      model
      version
      weather_location
      fwdr
      p_file_no
      above_grade_heated_floor_area
      below_grade_heated_floor_area
      dwelling_units_count
      baseloads
      hdd
      aec
      ref_aec
      building_envelope_surface_area
      building_volume
      ach
      nla
      aux_energy_required
      proposed_gshl
      ref_gshl
      design_cooling_load
      ac_cooling_capacity
      air_heat_pump_cooling_capacity
      grounded_heat_pump_cooling_capacity
      water_heat_pump_cooling_capacity
      heating_furnace
      heating_boiler
      heating_combo
      electrical_consumption
      natural_gas_consumption
      propane_consumption
      hot_water
      cooking
      laundry
    ]
  end

  def mappings
    Hash[
      mapped_attributes.map { |attribute| [attribute, self.send(attribute)] }
    ]
  end

  private

  def stage
    :proposed
  end

  def model
    xml.at("HouseFile/Application/Name").text
  end

  def version
    xml.at(
      "HouseFile/Application/Version/Labels/#{I18n.locale == :fr ? "French" : "English"}"
    ).text
  end

  def p_file_no
    @p_file_no ||=
      xml.at("HouseFile/ProgramInformation/File/Identification")&.text
  end

  def dwelling_units_count
    @dwelling_units_count ||=
      xml.at("HouseFile/Program/Results/Tsv/NumDwellingUnits/@value")&.text
  end

  def ach # air changes per hour @ 50Pa (airgtightnes value)
    @ach ||=
      xml
        .at(
          "HouseFile/House/NaturalAirInfiltration/Specifications/BlowerTest/@airChangeRate"
        )
        &.text
        &.to_f
  end

  def nla # Normalized Leakage Area
    @nla ||=
      xml.at("HouseFile/Program/Results/Tsv/NLA/@value")&.text.to_f.round(2)
  end

  def weather_location
    @weather_location ||=
      xml.at(
        "HouseFile/ProgramInformation/Weather/Location/#{I18n.locale == :fr ? "French" : "English"}"
      ).text
  end

  def building_volume
    @building_volume ||=
      xml
        .at(
          "HouseFile/House/NaturalAirInfiltration/Specifications/House/@volume"
        )
        &.text
        &.to_f
        &.round(1)
  end

  def building_envelope_surface_area
    @building_envelope_surface_area ||=
      xml
        .at("HouseFile/AllResults/Results/Other/GrossArea/@buildingSurfaceArea")
        &.text
        &.to_f
        &.round(1)
  end

  def fwdr
    @fwdr ||=
      xml.at("HouseFile/Program/Results/RefHse/theHouseFDWR/@value").text.to_f
  end

  def above_grade_heated_floor_area
    @above_grade_heated_floor_area ||=
      xml
        .at("HouseFile/House/Specifications/HeatedFloorArea/@aboveGrade")
        .text
        &.to_f
  end

  def below_grade_heated_floor_area
    @below_grade_heated_floor_area ||=
      xml
        .at("HouseFile/House/Specifications/HeatedFloorArea/@belowGrade")
        .text
        &.to_f
  end

  def aec # annual energy consumption (GJ/year)
    @aec ||=
      (
        xml.at("HouseFile/Program/Results/Tsv/EGHFconTotal/@value")&.text.to_f /
          1000
      ).round(2)
  end

  def ref_hse_results
    @ref_hse_results ||=
      xml.at('HouseFile/AllResults/Results[@houseCode="Reference"]')
  end

  def soc_results
    @soc_results ||= xml.at('HouseFile/AllResults/Results[@houseCode="SOC"]')
  end

  def baseloads # GJ/year
    @baseloads ||=
      ref_hse_results
        &.at("Annual/Consumption/Electrical/@baseload")
        &.text
        .to_f
        .round(2)
  end

  def hdd # heating degree day
    @hdd ||=
      xml
        .at("HouseFile/ProgramInformation/Weather/@heatingDegreeDay")
        &.text
        &.to_i
  end

  def design_cooling_load
    @design_cooling_load ||=
      xml
        .at("HouseFile/AllResults/Results/Other/@designCoolLossRate")
        &.text
        &.to_f
        .round(2)
  end

  def ac_cooling_capacity
    @ac_cooling_capacity ||=
      xml
        .at(
          "HouseFile/House/HeatingCooling/Type2/AirConditioning/Specifications/RatedCapacity/@value"
        )
        &.text
        &.to_f
  end

  def air_heat_pump_cooling_capacity
    @air_heat_pump_cooling_capacity ||=
      xml
        .at(
          "HouseFile/House/HeatingCooling/Type2/AirHeatPump/Specifications/OutputCapacity/@value"
        )
        &.text
        &.to_f
  end

  def grounded_heat_pump_cooling_capacity
    grounded_heat_pump ||=
      xml
        .at(
          "HouseFile/House/HeatingCooling/Type2/GroundHeatPump/Specifications/OutputCapacity/@value"
        )
        &.text
        &.to_f
  end

  def water_heat_pump_cooling_capacity
    @water_heat_pump ||=
      xml
        .at(
          "HouseFile/House/HeatingCooling/Type2/WaterHeatPump/Specifications/OutputCapacity/@value"
        )
        &.text
        &.to_f
  end

  def ref_aec # AEC of reference house (GJ/year)
    @ref_aec ||=
      ref_hse_results&.at("Annual/Consumption/@total")&.text&.to_f&.round(2)
  end

  def aux_energy_required # MJ/year
    @aux_energy_required ||=
      soc_results&.at("Annual/Load/@auxiliaryEnergy")&.text&.to_f&.round(2)
  end

  def ref_gshl # Reference Gross Space Heat Loss (GJ)
    @ref_gshl ||=
      ref_hse_results.at("Annual/Load/@grossHeating").text.to_f.round(2)
  end

  def proposed_gshl # Proposed Gross Space Heat Loss (GJ)
    @proposed_gshl ||=
      soc_results.at("Annual/Load/@grossHeating").text.to_f.round(2)
  end

  def electrical_consumption
    @electrical_consumption ||=
      (
        if monthly_electrical_consumption.sum > 0
          monthly_electrical_consumption.sum
        else
          annual_consumption
        end
      )
  end

  def annual_electrical_consumption
    @annual_electrical_consumption ||=
      soc_results.at("Annual/Consumption/Electrical/@total").text.to_f.round(2)
  end

  def monthly_electrical_consumption
    @monthly_electrical_consumption ||= [
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@january")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@february")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@march")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@april")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@may")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@june")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@july")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@august")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@september")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@october")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@november")
        .text
        .to_f
        .round(2),
      soc_results
        .at("Monthly/ElectricalConsumption/Gross/@december")
        .text
        .to_f
        .round(2)
    ]
  end

  def natural_gas_consumption
    @natural_gas_consumption ||=
      soc_results.at("Annual/Consumption/NaturalGas/@total").text.to_f.round(2)
  end

  def propane_consumption
    @propane_consumption ||=
      soc_results.at("Annual/Consumption/Propane/@total").text.to_f.round(2)
  end

  def heating_furnace
    xml
      .at(
        "HouseFile/House/HeatingCooling/Type1/Furnace/Equipment/EnergySource/@code"
      )
      .text
      .to_f
  end

  def heating_boiler
    xml
      .at(
        "HouseFile/House/HeatingCooling/Type1/Boiler/Equipment/EnergySource/@code"
      )
      &.text
      &.to_f
  end

  def heating_combo
    xml
      .at(
        "HouseFile/House/HeatingCooling/Type1/ComboHeatDhw/Equipment/EnergySource/@code"
      )
      &.text
      &.to_f
  end

  def hot_water
    xml
      .at("HouseFile/House/Components/HotWater/Primary/EnergySource/@code")
      .text
      .to_f
  end

  def cooking
    xml
      .at("HouseFile/House/BaseLoads/ElectricalUsage/Stove/EnergySource/@code")
      .text
      .to_f
  end

  def laundry
    xml
      .at(
        "HouseFile/House/BaseLoads/ElectricalUsage/ClothesDryer/EnergySource/@code"
      )
      .text
      .to_f
  end
end
