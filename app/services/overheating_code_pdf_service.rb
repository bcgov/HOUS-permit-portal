# frozen_string_literal: true

class OverheatingCodePdfService
  TEMPLATE_PATH =
    Rails
      .root
      .join("lib", "assets", "pdf_templates", "BC-SZCG-FormSetFill-Ver1.0a.pdf")
      .freeze

  KW_TO_BTUH = 3412.142

  FIELD_MAP = {
    "1-Copyright" => :issued_to,
    "2-Project" => :project_number,
    "3-Model" => :building_model,
    "4-Address" => :full_address,
    "5-City-Province" => :city_province,
    "6-Site" => :site_name,
    "7-Lot" => :lot,
    "8-PostalCode" => :postal_code,
    "ar-DesignatedRooms" => :designated_rooms,
    "c-Minimum Cooling Capacity" => :minimum_cooling_capacity_btuh,
    "28-OutDoorTemp" => :design_outdoor_temp,
    "29-Indoortemp" => :design_indoor_temp,
    "23-Adjacenttemp" => :design_adjacent_temp,
    "21-CZ-Area" => :cooling_zone_area,
    "12-WeatherLoc" => :weather_location,
    "22-Ventrate" => :ventilation_rate,
    "23-HRV/ERV Yes/No" => :hrv_erv_label,
    "21-ATRE" => :atre_percentage,
    "31-OS-ItemA" => [:components_facing_outside, 0],
    "34-OS-ItemB" => [:components_facing_outside, 1],
    "32-OS-ItemC" => [:components_facing_outside, 2],
    "35-OS-ItemD" => [:components_facing_outside, 3],
    "33-OS-ItemE" => [:components_facing_outside, 4],
    "35-OS-ItemF" => [:components_facing_outside, 5],
    "31-AS-ItemA" => [:components_facing_adjacent, 0],
    "34-AS-ItemB" => [:components_facing_adjacent, 1],
    "32-AS-ItemC" => [:components_facing_adjacent, 2],
    "35-AS-ItemD" => [:components_facing_adjacent, 3],
    "32-AS-ItemE" => [:components_facing_adjacent, 4],
    "35-AS-ItemF" => [:components_facing_adjacent, 5],
    "i-NotesLine1" => [:document_notes, 0],
    "j-NotesLine2" => [:document_notes, 1],
    "k-NotesLine3" => [:document_notes, 2],
    "l-NotesLine4" => [:document_notes, 3],
    "m-NotesLine5" => [:document_notes, 4],
    "55-Name" => :performer_name,
    "ResponisbleName" => :performer_name,
    "56-Company" => :performer_company,
    "57-Address" => :performer_address,
    "58-City&Prov" => :performer_city_province,
    "59-PostalCode" => :performer_postal_code,
    "60-Phone" => :performer_phone,
    "61-Fax" => :performer_fax,
    "62-E-Mail" => :performer_email,
    "64-AccredRef1" => :accreditation_ref1,
    "65-Accredref2" => :accreditation_ref2,
    "66-IssueDate1" => :issued_for1,
    "67-IssueDate2" => :issued_for2
  }.freeze

  def initialize(overheating_code)
    @oc = overheating_code
  end

  def generate
    doc = HexaPDF::Document.open(TEMPLATE_PATH)
    form = doc.acro_form

    return doc.io&.string || File.read(TEMPLATE_PATH) unless form

    FIELD_MAP.each do |pdf_field_name, source|
      field = form.field_by_name(pdf_field_name)
      next unless field

      value = resolve_value(source)
      field.field_value = value.to_s if value.present?
    end

    handle_unit_radio_buttons(form)

    form.delete(:NeedAppearances)
    form.create_appearances(force: true)
    form.flatten

    io = StringIO.new
    doc.write(io)
    io.string
  end

  def filename
    project = @oc.project_number.presence || @oc.id.first(8)
    "BC-SZCG-Report-#{project}.pdf"
  end

  private

  def resolve_value(source)
    case source
    when Symbol
      send(source)
    when Array
      column, index = source
      arr = @oc.public_send(column)
      arr.is_a?(Array) ? arr[index] : nil
    end
  end

  def city_province
    jurisdiction_name = @oc.jurisdiction&.qualified_name
    if jurisdiction_name.present?
      return "#{jurisdiction_name}, British Columbia"
    end

    "British Columbia"
  end

  def metric?
    @oc.cooling_zone_units == "metric"
  end

  def minimum_cooling_capacity_btuh
    val = @oc.minimum_cooling_capacity
    return nil if val.nil?

    metric? ? (val * KW_TO_BTUH).round(0) : val
  end

  def hrv_erv_label
    @oc.hrv_erv ? "Yes" : "No"
  end

  def handle_unit_radio_buttons(form)
    is_imperial = @oc.cooling_zone_units == "imperial"

    %w[Imperial Metric].each do |btn_name|
      field = form.field_by_name(btn_name)
      next unless field

      should_check =
        (btn_name == "Imperial" && is_imperial) ||
          (btn_name == "Metric" && !is_imperial)
      field.field_value = should_check
    end
  end

  def method_missing(method_name, *args)
    if @oc.respond_to?(method_name)
      @oc.public_send(method_name, *args)
    else
      super
    end
  end

  def respond_to_missing?(method_name, include_private = false)
    @oc.respond_to?(method_name, include_private) || super
  end
end
