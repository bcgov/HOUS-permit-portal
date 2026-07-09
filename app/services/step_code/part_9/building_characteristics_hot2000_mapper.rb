class StepCode::Part9::BuildingCharacteristicsHot2000Mapper
  FOSSIL_FUEL_PATTERN = /natural\s*gas|propane|fuel oil|oil/i

  attr_reader :xml

  def initialize(xml:)
    @xml = xml
  end

  def mappings
    {
      roof_ceilings_lines: roof_ceilings_lines,
      above_grade_walls_lines: above_grade_walls_lines,
      framings_lines: framings_lines,
      unheated_floors_lines: unheated_floors_lines,
      below_grade_walls_lines: below_grade_walls_lines,
      slabs_lines: slabs_lines,
      windows_glazed_doors: windows_glazed_doors,
      doors_lines: doors_lines,
      airtightness: airtightness,
      space_heating_cooling_lines: space_heating_cooling_lines,
      hot_water_lines: hot_water_lines,
      ventilation_lines: ventilation_lines,
      fossil_fuels: fossil_fuels
    }.compact_blank
  end

  private

  def roof_ceilings_lines
    lines_for("HouseFile/House/Components/Ceiling", "Construction/CeilingType")
  end

  def above_grade_walls_lines
    lines_for("HouseFile/House/Components/Wall", "Construction/Type")
  end

  def framings_lines
    lines_for("HouseFile/House/Components//FloorHeader", "Construction/Type")
  end

  def unheated_floors_lines
    lines_for("HouseFile/House/Components/Floor", "Construction/Type")
  end

  def below_grade_walls_lines
    xml
      .xpath("HouseFile/House/Components/Basement/Wall")
      .filter_map do |wall|
        insulation =
          wall.at("Construction/InteriorAddedInsulation") ||
            wall.at("Construction/ExteriorAddedInsulation")
        next if insulation.blank?

        line(
          details:
            details(
              wall.parent,
              insulation.at("Description")&.text || insulation.text
            ),
          rsi:
            decimal(insulation.at("Composite/Section/@rsi")&.text) ||
              decimal(insulation["nominalInsulation"])
        )
      end
  end

  def slabs_lines
    xml
      .xpath("HouseFile/House/Components/Basement/Floor")
      .filter_map do |floor|
        added_to_slab = floor.at("Construction/AddedToSlab")
        next if added_to_slab.blank?

        line(
          details: details(floor.parent, added_to_slab.text),
          rsi: decimal(added_to_slab["rValue"])
        )
      end
  end

  def windows_glazed_doors
    lines =
      xml
        .xpath("HouseFile/House/Components//Window")
        .filter_map do |window|
          type = window.at("Construction/Type")
          line(
            details: details(window, type&.text),
            performance_value: window_usi(window),
            shgc: decimal(window["shgc"])
          )
        end

    return if lines.blank?

    { performance_type: :usi, lines: unique_lines(lines) }
  end

  def doors_lines
    xml
      .xpath("HouseFile/House/Components//Door")
      .filter_map do |door|
        type = door.at("Construction/Type")
        line(
          details: details(door, type&.text),
          performance_type: :rsi,
          performance_value: decimal(door["rValue"])
        )
      end
      .then { |lines| unique_lines(lines) }
  end

  def airtightness
    blower_test =
      xml.at("HouseFile/House/NaturalAirInfiltration/Specifications/BlowerTest")
    return if blower_test.blank?

    ach = decimal(blower_test["airChangeRate"])
    leakage_area = decimal(blower_test["leakageArea"])
    detail_parts = []
    detail_parts << "ACH @ 50 Pa: #{ach}" if ach.present?
    detail_parts << "Leakage area: #{leakage_area}" if leakage_area.present?

    line(details: detail_parts.join("; "))
  end

  def space_heating_cooling_lines
    lines = []
    lines.concat(type_1_heating_lines)
    lines.concat(type_2_heating_cooling_lines)
    lines.concat(supplementary_heating_lines)
    unique_lines(lines)
  end

  def hot_water_lines
    xml
      .xpath("HouseFile/House/Components/HotWater/Primary")
      .filter_map do |primary|
        energy_factor = primary.at("EnergyFactor")
        line(
          details:
            details_from_parts(
              "Domestic hot water",
              text_at(primary, "EnergySource/English"),
              text_at(primary, "TankType/English")
            ),
          performance_type: :ef,
          performance_value: decimal(energy_factor&.[]("value"))
        )
      end
  end

  def ventilation_lines
    xml
      .xpath("HouseFile/House/Ventilation/WholeHouseVentilatorList/*")
      .filter_map do |ventilator|
        line(
          details:
            details_from_parts(
              text_at(ventilator, "VentilatorType/English"),
              text_at(ventilator, "EquipmentInformation/Manufacturer")
            ),
          percent_eff: decimal(ventilator["efficiency1"]),
          liters_per_sec:
            decimal(ventilator["supplyFlowrate"]) ||
              decimal(ventilator["exhaustFlowrate"])
        )
      end
  end

  def fossil_fuels
    sources =
      xml
        .xpath("HouseFile/House//EnergySource/English")
        .map { |node| node.text.squish }
        .reject(&:blank?)
        .uniq
    fossil_sources = sources.grep(FOSSIL_FUEL_PATTERN)
    has_fossil_fuel = fossil_sources.present?

    {
      presence: has_fossil_fuel ? :yes : :no,
      details:
        if has_fossil_fuel
          "Fossil fuel energy sources: #{fossil_sources.join(", ")}"
        else
          "No fossil fuel energy sources found in H2K file"
        end
    }
  end

  def type_1_heating_lines
    %w[Furnace Boiler ComboHeatDhw].filter_map do |name|
      system = xml.at("HouseFile/House/HeatingCooling/Type1/#{name}")
      next if system.blank?

      line(
        details: equipment_details(name, system),
        variant: :principal,
        performance_type: :afue,
        performance_value:
          decimal(system.at("Specifications")&.[]("efficiency"))
      )
    end
  end

  def type_2_heating_cooling_lines
    lines = []
    xml
      .xpath("HouseFile/House/HeatingCooling/Type2/*")
      .each do |system|
        heating_efficiency = system.at("Specifications/HeatingEfficiency")
        cooling_efficiency = system.at("Specifications/CoolingEfficiency")
        next if heating_efficiency.blank? && cooling_efficiency.blank?

        details = equipment_details(system.name, system)
        if heating_efficiency.present?
          lines << line(
            details: details,
            variant: :secondary,
            performance_type:
              boolean_attribute?(heating_efficiency, "isCop") ? :cop : :hspf,
            performance_value: decimal(heating_efficiency["value"])
          )
        end
        if cooling_efficiency.present?
          lines << line(
            details: "#{details} cooling",
            variant: :secondary,
            performance_type:
              boolean_attribute?(cooling_efficiency, "isCop") ? :cop : :seer,
            performance_value: decimal(cooling_efficiency["value"])
          )
        end
      end

    lines
  end

  def supplementary_heating_lines
    xml
      .xpath(
        "HouseFile/House/HeatingCooling/SupplementaryHeatingSystems/System"
      )
      .filter_map do |system|
        line(
          details:
            details_from_parts(
              "Supplementary heating",
              text_at(system, "Equipment/EnergySource/English"),
              text_at(system, "Equipment/Type/English")
            ),
          variant: :secondary,
          performance_type: :afue,
          performance_value:
            decimal(system.at("Specifications")&.[]("efficiency"))
        )
      end
  end

  def lines_for(component_path, construction_path)
    xml
      .xpath(component_path)
      .filter_map do |component|
        construction = component.at(construction_path)
        line(
          details: details(component, construction&.text),
          rsi: decimal(construction&.[]("rValue"))
        )
      end
      .then { |lines| unique_lines(lines) }
  end

  def window_usi(window)
    type = window.at("Construction/Type")
    rsi = decimal(type&.[]("rValue"))
    return (1 / rsi).round(2) if rsi.present? && rsi.positive?

    code = code_node("Window", type&.[]("idref"))
    decimal(code&.at("Layers/Window/OverallThermalResistance/@value")&.text)
  end

  def code_node(kind, id)
    return if id.blank?

    xml.xpath("HouseFile/Codes/#{kind}//Code").find { |node| node["id"] == id }
  end

  def equipment_details(name, node)
    details_from_parts(
      name.underscore.humanize,
      text_at(node, "Equipment/EnergySource/English"),
      text_at(node, "Equipment/EquipmentType/English"),
      text_at(node, "Equipment/Type/English"),
      text_at(node, "Equipment/Function/English")
    )
  end

  def details(component, extra = nil)
    details_from_parts(text_at(component, "Label"), extra)
  end

  def details_from_parts(*parts)
    parts.map { |part| part.to_s.squish }.reject(&:blank?).uniq.join(" - ")
  end

  def line(attributes)
    compacted = attributes.compact_blank
    return if compacted.blank?

    compacted
  end

  def unique_lines(lines)
    lines.compact.uniq { |line| line[:details].presence || line.to_s }
  end

  def text_at(node, path)
    node&.at(path)&.text
  end

  def decimal(value)
    return if value.blank?

    BigDecimal(value.to_s).round(4).to_f
  end

  def boolean_attribute?(node, attribute)
    ActiveModel::Type::Boolean.new.cast(node[attribute])
  end
end
