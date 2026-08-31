require "csv"

class StepCodeChecklistDumpService
  # ponytail: N is 2× all-time max nonempty lines so every download has the same
  # headers. Empty default rows (variant / performance_type only) do not count.
  # Raise the multiplier if someone exceeds the buffer.
  LINE_GROUPS = {
    roof_ceilings: {
      lines: ->(s) { s.roof_ceilings_lines },
      prefix: "Roof ceiling",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    above_grade_walls: {
      lines: ->(s) { s.above_grade_walls_lines },
      prefix: "Above grade walls",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    framings: {
      lines: ->(s) { s.framings_lines },
      prefix: "Framing",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    unheated_floors: {
      lines: ->(s) { s.unheated_floors_lines },
      prefix: "Unheated floors",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    below_grade_walls: {
      lines: ->(s) { s.below_grade_walls_lines },
      prefix: "Below grade walls",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    slabs: {
      lines: ->(s) { s.slabs_lines },
      prefix: "Slabs",
      fields: [[:details, "details"], [:rsi, "average effective RSI"]]
    },
    doors: {
      lines: ->(s) { s.doors_lines },
      prefix: "Doors",
      fields: [
        [:details, "details"],
        [:performance_type, "performance type"],
        [:performance_value, "performance value"]
      ]
    },
    space_heating_cooling: {
      lines: ->(s) { s.space_heating_cooling_lines },
      prefix: "Space heating / cooling",
      fields: [
        [:details, "details"],
        [:variant, "variant"],
        [:performance_type, "performance type"],
        [:performance_value, "performance value"]
      ]
    },
    hot_water: {
      lines: ->(s) { s.hot_water_lines },
      prefix: "Hot water",
      fields: [
        [:details, "details"],
        [:performance_type, "performance type"],
        [:performance_value, "performance value"]
      ]
    },
    ventilation: {
      lines: ->(s) { s.ventilation_lines },
      prefix: "Ventilation",
      fields: [
        [:details, "details"],
        [:percent_eff, "percent eff"],
        [:liters_per_sec, "L/s"]
      ]
    },
    other: {
      lines: ->(s) { s.other_lines },
      prefix: "Other",
      fields: [[:details, "details"]]
    },
    windows_glazed_doors: {
      lines: ->(s) { s.windows_glazed_doors.lines },
      prefix: "Windows and glazed doors",
      fields: [
        [:details, "details"],
        [:performance_value, "performance value"],
        [:shgc, "SHGC"]
      ]
    }
  }.freeze

  CHECKLIST_ATTRS = %i[
    building_type
    compliance_path
    completed_by
    completed_at
    completed_by_company
    completed_by_phone
    completed_by_address
    completed_by_email
    completed_by_service_organization
    energy_advisor_id
    site_visit_completed
    site_visit_date
    testing_pressure
    testing_pressure_direction
    testing_result_type
    testing_result
    tester_name
    tester_company_name
    tester_email
    tester_phone
    home_state
    compliance_status
    notes
    hvac_consumption
    dwh_heating_consumption
    ref_hvac_consumption
    ref_dwh_heating_consumption
    epc_calculation_airtightness
    epc_calculation_testing_target_type
    epc_calculation_compliance
    codeco
    builder
    step_requirement_id
    stage_completed_at
  ].freeze

  DATA_ENTRY_ATTRS = %i[
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
    district_energy_consumption
    district_energy_ef
    other_ghg_consumption
    other_ghg_ef
    hot_water
    cooking
    laundry
  ].freeze

  def initialize(range:)
    @range = range
  end

  def part_9_csv
    widths = measure_widths
    headers = build_headers(widths)

    CSV.generate(headers: true) do |csv|
      csv << headers
      scope.find_each { |checklist| csv << row_for(checklist, widths) }
    end
  end

  def csv_filename
    "part_9_step_code_checklists_#{@range.slug}_#{Date.current.iso8601}.csv"
  end

  private

  def scope
    @range.apply(loaded_checklists, "part_9_step_code_checklists.created_at")
  end

  def loaded_checklists
    Part9StepCode::Checklist.includes(
      :building_characteristics_summary,
      :data_entries,
      step_code: %i[jurisdiction permit_application]
    )
  end

  def measure_widths
    widths = LINE_GROUPS.keys.index_with { 0 }
    widths[:data_entries] = 0

    loaded_checklists.find_each do |checklist|
      summary = checklist.building_characteristics_summary
      if summary
        LINE_GROUPS.each do |key, spec|
          n =
            Array(spec[:lines].call(summary)).count do |line|
              nonempty_line?(line)
            end
          widths[key] = n if n > widths[key]
        end
      end
      n = checklist.data_entries.size
      widths[:data_entries] = n if n > widths[:data_entries]
    end

    LINE_GROUPS.each_key { |key| widths[key] = [widths[key] * 2, 1].max }
    widths[:data_entries] *= 2
    widths
  end

  def build_headers(widths)
    headers = identity_headers + CHECKLIST_ATTRS.map { |attr| human(attr) }
    headers += [
      "Airtightness details",
      "Fossil fuels presence",
      "Fossil fuels details",
      "Windows performance type"
    ]
    LINE_GROUPS.each do |key, spec|
      n = widths[key]
      next unless n.positive?

      (1..n).each do |i|
        spec[:fields].each do |_field, label|
          headers << "#{spec[:prefix]} #{label} #{i}"
        end
      end
    end
    n = widths[:data_entries]
    if n.positive?
      (1..n).each do |i|
        DATA_ENTRY_ATTRS.each do |attr|
          headers << "Data entry #{i} #{human(attr)}"
        end
        headers << "Data entry #{i} H2K filename"
      end
    end
    headers
  end

  def row_for(checklist, widths)
    step_code = checklist.step_code
    summary = checklist.building_characteristics_summary
    cells = [
      cell(checklist.id),
      cell(checklist.step_code_id),
      cell(checklist.permit_application_number),
      cell(checklist.reference_number),
      cell(checklist.jurisdiction_name),
      cell(checklist.full_address),
      cell(checklist.pid),
      cell(step_code&.discarded?),
      cell(checklist.stage),
      cell(checklist.status),
      cell(checklist.created_at),
      cell(checklist.updated_at)
    ]
    CHECKLIST_ATTRS.each { |attr| cells << cell(checklist.public_send(attr)) }
    cells << cell(summary&.airtightness&.details)
    cells << cell(summary&.fossil_fuels&.presence)
    cells << cell(summary&.fossil_fuels&.details)
    cells << cell(summary&.windows_glazed_doors&.performance_type)

    LINE_GROUPS.each do |key, spec|
      n = widths[key]
      next unless n.positive?

      lines =
        (
          if summary
            Array(spec[:lines].call(summary)).select do |line|
              nonempty_line?(line)
            end
          else
            []
          end
        )
      (1..n).each do |i|
        line = lines[i - 1]
        spec[:fields].each { |field, _label| cells << line_value(line, field) }
      end
    end

    n = widths[:data_entries]
    if n.positive?
      entries = checklist.data_entries.sort_by(&:created_at)
      (1..n).each do |i|
        entry = entries[i - 1]
        DATA_ENTRY_ATTRS.each { |attr| cells << cell(entry&.public_send(attr)) }
        cells << cell(entry&.h2k_file_name)
      end
    end

    cells
  end

  def identity_headers
    [
      "Checklist ID",
      "Step Code ID",
      "Application number",
      "Reference number",
      "Jurisdiction",
      "Address",
      "PID",
      "Discarded",
      "Stage",
      "Status",
      "Created at",
      "Updated at"
    ]
  end

  def nonempty_line?(line)
    hash = line_hash(line)
    hash.except(:variant, :performance_type).values.any?(&:present?)
  end

  def line_value(line, field)
    return nil unless line

    cell(line_hash(line)[field])
  end

  def line_hash(line)
    raw = line.respond_to?(:attributes) ? line.attributes : line.to_h
    raw.symbolize_keys
  end

  def human(attr)
    attr.to_s.titleize
  end

  def cell(value)
    case value
    when nil
      nil
    when Time, DateTime, ActiveSupport::TimeWithZone, Date
      value.iso8601
    else
      value
    end
  end
end
