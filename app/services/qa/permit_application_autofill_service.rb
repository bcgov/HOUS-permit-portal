class Qa::PermitApplicationAutofillService
  QA_PLACEHOLDER_PDF = <<~PDF.freeze
    %PDF-1.4
    1 0 obj
    << /Type /Catalog /Pages 2 0 R >>
    endobj
    2 0 obj
    << /Type /Pages /Count 0 >>
    endobj
    trailer
    << /Root 1 0 R >>
    %%EOF
  PDF

  def initialize(permit_application:, current_user:)
    @permit_application = permit_application
    @current_user = current_user
  end

  def call
    submission_data =
      @permit_application.submission_data.deep_dup.presence || { "data" => {} }
    submission_data["data"] ||= {}

    clean_stale_autofill_values!(submission_data)

    Array(form_json["components"]).each do |section|
      section_key = section["key"].presence || "qa-section"
      submission_data["data"][section_key] ||= {}

      fill_components(
        section["components"],
        submission_data["data"][section_key]
      )
    end

    updated = @permit_application.update(submission_data: submission_data)

    raise ActiveRecord::RecordInvalid, @permit_application unless updated

    @permit_application.reload
  end

  private

  def form_json
    @form_json ||=
      @permit_application.form_json(current_user: effective_user) || {}
  end

  def effective_user
    return @current_user unless @current_user.review_staff?

    @permit_application.submitter || @current_user
  end

  def fill_components(components, section_data)
    Array(components).each do |component|
      key = component["key"]

      if multiply_sum_grid_component?(component)
        fill_multiply_sum_grid(component, section_data)
        next
      end

      if datagrid_component?(component)
        section_data[key] = [datagrid_row_for(component)] if qa_key?(key)
        next
      end

      if file_component?(component)
        section_data[key] = file_value_for(
          component,
          section_data[key]
        ) if qa_key?(key)
      elsif autofillable_component?(component)
        section_data[key] = value_for(component)
      end

      fill_components(component["components"], section_data)
      Array(component["columns"]).each do |column|
        fill_components(column["components"], section_data)
      end
      Array(component["rows"]).flatten.each do |cell|
        fill_components(cell["components"], section_data) if cell.is_a?(Hash)
      end
    end
  end

  def fillable_key?(key)
    qa_key?(key) && !key.end_with?("_file")
  end

  def qa_key?(key)
    key.present? && key.include?("|RB")
  end

  def autofillable_component?(component)
    fillable_key?(component["key"]) && component["input"] == true
  end

  def datagrid_component?(component)
    component["type"] == "datagrid"
  end

  def multiply_sum_grid_component?(component)
    component["custom_class"] == "multiply-sum-grid"
  end

  def file_component?(component)
    %w[file simplefile].include?(component["type"]) ||
      component["key"].to_s.end_with?("_file")
  end

  def fill_multiply_sum_grid(component, section_data)
    datagrid =
      Array(component["components"]).find do |child|
        child["type"] == "datagrid"
      end
    return unless datagrid&.dig("key").present?

    rows = multiply_sum_grid_rows(datagrid)
    section_data[datagrid["key"]] = rows

    Array(component["components"]).each do |child|
      case child["key"].to_s
      when /\|totalQuantity(\|v[0-9a-f]+)?$/
        section_data[child["key"]] = rows.sum { |row| row["quantity"].to_f }
      when /\|totalLoad(\|v[0-9a-f]+)?$/
        section_data[child["key"]] = rows.sum do |row|
          row["a"].to_f * row["quantity"].to_f
        end
      end
    end
  end

  def multiply_sum_grid_rows(datagrid)
    configured_rows = Array(datagrid["defaultValue"])
    configured_rows = [{}] if configured_rows.blank?

    configured_rows.map do |row|
      a_value = row["a"].presence || 1
      quantity_value = 1

      {
        "name" => row["name"].presence || "QA test value",
        "a" => a_value,
        "quantity" => quantity_value,
        "load" => a_value.to_f * quantity_value
      }
    end
  end

  def datagrid_row_for(component)
    row = {}
    fill_datagrid_row_components(component["components"], row)
    row
  end

  def fill_datagrid_row_components(components, row)
    Array(components).each do |component|
      key = component["key"]

      if file_component?(component)
        row[key] = file_value_for(component, row[key]) if qa_key?(key)
      elsif autofillable_component?(component)
        row[key] = value_for(component)
      end

      fill_datagrid_row_components(component["components"], row)
      Array(component["columns"]).each do |column|
        fill_datagrid_row_components(column["components"], row)
      end
      Array(component["rows"]).flatten.each do |cell|
        if cell.is_a?(Hash)
          fill_datagrid_row_components(cell["components"], row)
        end
      end
    end
  end

  def file_value_for(component, current_value)
    return current_value if current_value.is_a?(Array) && current_value.present?

    document = qa_supporting_document_for(component["key"])
    metadata = document.file_data.fetch("metadata", {})

    [
      document.file_data.merge(
        "name" => metadata["filename"],
        "originalName" => metadata["filename"],
        "filename" => metadata["filename"],
        "size" => metadata["size"],
        "type" => metadata["mime_type"],
        "storage" => "s3custom",
        "model" => "SupportingDocument",
        "modelId" => document.id
      )
    ]
  end

  def qa_supporting_document_for(data_key)
    @qa_supporting_documents ||= {}
    @qa_supporting_documents[
      data_key
    ] ||= reusable_supporting_documents.find do |document|
      document.data_key == data_key
    end || create_qa_supporting_document!(data_key)
  end

  def create_qa_supporting_document!(data_key)
    io = StringIO.new(QA_PLACEHOLDER_PDF)
    io.define_singleton_method(:original_filename) { "qa-placeholder.pdf" }
    io.define_singleton_method(:content_type) { "application/pdf" }

    uploaded_file = FileUploader.upload(io, :store, metadata: false)
    uploaded_file.metadata.merge!(
      "filename" => "qa-placeholder.pdf",
      "size" => QA_PLACEHOLDER_PDF.bytesize,
      "mime_type" => "application/pdf"
    )

    @permit_application.supporting_documents.create!(
      data_key: data_key,
      scan_status: "clean",
      file_data: uploaded_file.data
    )
  end

  def reusable_supporting_documents
    @reusable_supporting_documents ||=
      @permit_application
        .supporting_documents
        .order(created_at: :desc)
        .select do |document|
          document.file_data.present? && document.file_data["id"].present? &&
            !document.file_data["id"].start_with?("qa-mode/")
        end
  end

  def clean_stale_autofill_values!(submission_data)
    collect_components(form_json).each do |component|
      key = component["key"]
      next unless qa_key?(key)
      if datagrid_component?(component) || file_component?(component) ||
           autofillable_component?(component)
        next
      end

      section_key = PermitApplication.section_from_key(key)
      next unless submission_data.dig("data", section_key).is_a?(Hash)

      submission_data["data"][section_key].delete(key)
    end
  end

  def value_for(component)
    case component["type"]
    when "checkbox"
      true
    when "number", "currency"
      1
    when "datetime"
      Time.zone.today.iso8601
    when "day"
      "2026-01-01"
    when "select"
      select_value(component)
    when "selectboxes"
      selectboxes_value(component)
    when "radio"
      select_value(component)
    when "email", "simpleemail", "simpleemailadvanced"
      "qa@example.com"
    when "phoneNumber", "phone", "simplephonenumber",
         "simplephonenumberadvanced"
      "(250) 555-0100"
    when "address", "simpleaddressadvanced"
      {
        "display_name" => "123 QA Street, Victoria, BC",
        "lat" => "48.4284",
        "lon" => "-123.3656",
        "address" => {
          "road" => "QA Street",
          "city" => "Victoria",
          "state" => "British Columbia",
          "country" => "Canada"
        }
      }
    when "file"
      []
    else
      "QA test value"
    end
  end

  def select_value(component)
    values = component.dig("data", "values") || component["values"] || []
    first_value = values.first

    return "qa" unless first_value.is_a?(Hash)

    first_value["value"].presence || first_value["label"].presence || "qa"
  end

  def selectboxes_value(component)
    values = component.dig("values") || component.dig("data", "values") || []
    values.each_with_object({}) do |value, result|
      next unless value.is_a?(Hash)

      option_value = value["value"].presence || value["label"]
      result[option_value] = true if option_value.present?
    end
  end

  def collect_components(component)
    case component
    when Hash
      [component] + collect_components(component["components"]) +
        collect_components(component["columns"]) +
        collect_components(component["rows"])
    when Array
      component.flat_map { |item| collect_components(item) }
    else
      []
    end
  end
end
