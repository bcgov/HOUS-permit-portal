class ExternalPermitApplicationService
  attr_accessor :permit_application

  def initialize(permit_application)
    self.permit_application = permit_application
  end

  # This method will format the submission data for external use, such as by third party integrators.
  # The expected return schema will be as follows:
  # Record<string (requirement_block_sku), {
  #   id: string,
  #   requirement_block_code: string (requirement_sku),
  #   name: string,
  #   description?: string,
  #   requirements: Array<Record<requirement_sku, {
  #                     id: string,
  #                     name: string,
  #                     requirement_code: string,
  #                     type: string e.g. text, textarea, number, multi_contact, etc..,
  #                     value: richtext | string | Array<{name, email, etc..}> | etc.., // the formatted value submitted
  #                 }>>
  #   }>
  def formatted_submission_data_for_external_use
    unless self.permit_application.submission_data.present? &&
             self.permit_application.submission_data["data"].present?
      return {}
    end

    cloned_submission_data =
      self.permit_application.submission_data["data"].deep_dup

    # formats single_contact submissions into array of contact objects, similar to the multi_contact submissions
    process_single_contact_submission_data_to_common_format!(
      cloned_submission_data
    )

    formatted_submission_data = {}

    # first level key is the section_key, which we can ignore
    cloned_submission_data.each do |_section_key, section_value|
      # second level includes the actual submitted values
      section_value.each do |submitted_field_key, submitted_value|
        # key is in the format "formSubmissionDataRSTsection6736da0b-860e-43e6-9823-86c7d6562f1e|RBc2683830-8fe1-4979
        # -bd54-d6c993f3148c|building_project_value".
        # The requirement_block_id is in the format {dynamic_prefix}|RB{id}|{dynamic_suffix}.
        # So the requirement block id in the example is c2683830-8fe1-4979-bd54-d6c993f3148c, in the example above.
        submitted_field_key_split = submitted_field_key.split("|RB")

        next unless submitted_field_key_split.length > 1

        requirement_block_id = submitted_field_key_split.last.split("|").first

        requirement_block = get_requirement_block_json(requirement_block_id)

        next unless requirement_block.present?

        # set up the formatted requirement block data, with the key being the requirement sku
        if !formatted_submission_data.key?(requirement_block["sku"])
          formatted_submission_data[requirement_block["sku"]] = {
            id: requirement_block["id"],
            requirement_block_code: requirement_block["sku"],
            name: requirement_block["name"],
            description: requirement_block["description"],
            requirements: []
          }
        end

        requirement =
          requirement_block["requirements"].find do |req|
            # The submission key format is
            # `formSubmissionData{section_specific_prefix}|RB{requirement_block_id}|{requirement_ending_key}
            # The section_specific_prefix for the key is dynamic based on template sections etc.
            # So, the submission key will not be the same as the requirement form_json key.
            # However, the end (|RB{requirement_block_id}|{ending_key}) of the submission key
            # will be the same as the end of requirement form_json key
            # So, we get the requirement using the ending_key.
            common_ending_key = submitted_field_key.split("|RB").last

            req.dig("form_json", "key").ends_with?(common_ending_key)
          end

        next unless requirement.present?

        # Formatted submitted value by the submitter
        formatted_value =
          if submitted_field_key.to_s.ends_with?("multi_contact")
            get_formatted_multi_contact_submission_value(submitted_value)
          elsif requirement["input_type"] == "file"
            get_file_urls_from_submission_value(submitted_value)
          else
            submitted_value
          end

        # add the requirement data and formatted submitted value to the requirement_block -> requirements array in the
        # formatted_submission_data
        formatted_submission_data[requirement_block["sku"]][:requirements] << {
          id: requirement["id"],
          name: requirement["label"],
          requirement_code: requirement["requirement_code"],
          type: requirement["input_type"],
          value: formatted_value
        }
      end
    end

    remaining_energy_step_code_submission =
      form_remaining_energy_step_code_submission_data

    if remaining_energy_step_code_submission.present?
      formatted_submission_data.merge!(remaining_energy_step_code_submission)
    end

    formatted_submission_data
  end

  def get_requirement_block_json(requirement_block_id)
    self.permit_application.template_version.requirement_blocks_json[
      requirement_block_id
    ]
  end

  def get_raw_h2k_files
    unless permit_application.step_code.present? &&
             !permit_application
               .step_code
               .pre_construction_checklist
               .data_entries
               .empty?
      return nil
    end

    permit_application
      .step_code
      .pre_construction_checklist
      .data_entries
      .map do |data_entry|
        url = data_entry.h2k_file_url
        next unless url.present?

        {
          id: data_entry.id,
          name: data_entry.h2k_file_name,
          type: data_entry.h2k_file_type,
          size: data_entry.h2k_file_size,
          url: data_entry.h2k_file_url
        }
      end
      .compact
  end

  private

  # single_contact submissions are not formatted in the same way as multi_contact submissions.
  # The original submission data store's each single_contact properties as separate key value pairs.
  # i.e ${prefix}|email, ${prefix}|phone, ${prefix}|name, etc. This makes it difficult to format the data.
  # multi_contact submissions store all contact properties in a single object, making it easier to format the data.
  # This method will format single_contact submissions similar to the multi_contact submissions, into array of contact
  # objects. This will also delete the original single contact key value pairs from the submission data.
  def process_single_contact_submission_data_to_common_format!(submission_data)
    # first level key is the section_key, which we can ignore
    submission_data.each do |section_key, section_value|
      contact_submissions_to_merge = {}

      # second level contains the actual submitted values with they keys being the formIo compatible keys.
      # e.g. key format :"formSubmissionDataRSTsection6736da0b-860e-43e6-9823-86c7d6562f1e|RBc2683830-8fe1-4979-bd54-d6c993f3148c|building_project_value"
      section_value.each do |submitted_field_key, submitted_value|
        # skip unless the key is a contact field key and not a multi_contact field key.
        unless !submitted_field_key.ends_with?("multi_contact") &&
                 (
                   submitted_field_key.include?("general_contact") ||
                     submitted_field_key.include?("professional_contact")
                 )
          next
        end

        split_submitted_field_key = submitted_field_key.split("|")

        # since submitted_field_key is in the format {prefix}|{contact_property_key}, we need to pop the last element
        # to get the contact_property_key, e.g. email from {prefix}|email
        # We also need to snake_case the contact_property_key as it is camelized in the submission data.
        contact_property_key = split_submitted_field_key.pop.underscore

        # the formatted key will be the prefix, which is the requirement key, e.g. {prefix} from {prefix}|email
        formatted_requirement_key = split_submitted_field_key.join("|")

        # create a new key and value pair, to collect the fragmented single_contact field values into a single array,
        # with one contact object.

        contact_submissions_to_merge[formatted_requirement_key] = [
          {}
        ] unless contact_submissions_to_merge[
          formatted_requirement_key
        ].present?

        contact_submissions_to_merge[formatted_requirement_key].first[
          contact_property_key
        ] = submitted_value

        # delete the original single_contact key value pair from the submission data
        submission_data[section_key].delete(submitted_field_key)
      end

      # merge the single_contact formatted data with the original submission data
      submission_data[section_key].merge!(contact_submissions_to_merge)
    end
  end

  # The raw contact_array is an array of contact objects. However, the key of the contact object
  # has a prefix that is not needed and prop is camelized. This method will remove the prefix from
  # the key of each contact object and snake_case them.
  # e.g [ { "{prefix}|email": val, "{prefix}|firstName": val ] to  [ { "email": val, "first_name": val ]
  def get_formatted_multi_contact_submission_value(contact_array)
    contact_array.map do |contact_value|
      formatted_contact_value = {}

      contact_value.each do |contact_field_key, contact_field_value|
        contact_field_key_split = contact_field_key.split("|")

        next unless contact_field_key_split.length > 1

        # since contact_field_key is in the format {prefix}|{contact_property_key}, we need to pop the last element
        # to get the contact_property_key, e.g. email from {prefix}|email
        # We also need to snake_case the contact_property_key as it is camelized in the submission data.
        formatted_key = contact_field_key_split.last.underscore

        formatted_contact_value[formatted_key] = contact_field_value
      end

      formatted_contact_value
    end
  end

  def get_file_urls_from_submission_value(submitted_value)
    return nil unless submitted_value.present? && submitted_value.is_a?(Array)

    submitted_value
      .map do |file_data|
        file_model_name = file_data["model"]
        file_model_id = file_data["model_id"]
        next unless file_model_name.present? && file_model_id.present?

        file_model = file_model_name.constantize.find_by(id: file_model_id)

        next unless file_model.present?

        {
          id: file_model_id,
          name: file_data&.dig("metadata", "filename"),
          type: file_data["type"],
          size: file_data["size"],
          url: file_model.file_url
        }
      end
      .compact
  end

  def form_remaining_energy_step_code_submission_data
    return nil unless permit_application.present?

    latest_submission_version = permit_application.latest_submission_version

    return nil unless latest_submission_version.present?

    checklist_document =
      latest_submission_version.supporting_documents.find_by(
        data_key: PermitApplication::CHECKLIST_PDF_DATA_KEY
      )

    return nil unless checklist_document.present?

    url = checklist_document.file_url

    return nil unless url.present?

    # These is originally not part of the requirement model, but to keep a unified structure, we will format it as such.
    file_values = [
      {
        id: checklist_document.id,
        name: checklist_document.file_name,
        type: checklist_document.file_type,
        size: checklist_document.file_size,
        url: checklist_document.file_url
      }
    ]

    {
      id: "energy_step_code_tool",
      requirement_block_code: "energy_step_code_tool",
      name: "Energy step code",
      description: "",
      requirement: [
        {
          id: "energy_step_code_documents",
          name: "Energy step code documents",
          requirement_code: "energy_step_code_documents",
          type: :file,
          value: file_values
        }
      ]
    }
  end
end
