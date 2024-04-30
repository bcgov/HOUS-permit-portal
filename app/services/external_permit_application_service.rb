class ExternalPermitApplicationService
  attr_accessor :permit_application

  def initialize(permit_application)
    self.permit_application = permit_application
  end

  def formatted_submission_data_for_external_use
    unless self.permit_application.submission_data.present? && self.permit_application.submission_data["data"].present?
      return {}
    end

    cloned_submission_data = self.permit_application.submission_data["data"].deep_dup

    cloned_submission_data.each do |section_key, section_value|
      contact_submissions_to_merge = {}

      section_value.each do |submitted_field_key, submitted_value|
        unless !submitted_field_key.ends_with?("multi_contact") &&
                 (
                   submitted_field_key.include?("general_contact") ||
                     submitted_field_key.include?("professional_contact")
                 )
          next
        end

        # create a new key and value pair, to collect non multi_contact contact field values
        # into a single array of contact objects, similar to multi_contact contacts.
        # This will enable us to have a consistent data structure for all contact submissions, making
        # it easier to format the data
        split_submitted_field_key = submitted_field_key.split("|")

        contact_property_key = split_submitted_field_key.pop

        formatted_requirement_key = split_submitted_field_key.join("|")

        contact_submissions_to_merge[formatted_requirement_key] = [{}] unless contact_submissions_to_merge[
          formatted_requirement_key
        ].present?

        contact_submissions_to_merge[formatted_requirement_key].first[contact_property_key] = submitted_value

        cloned_submission_data[section_key].delete(submitted_field_key)
      end

      cloned_submission_data[section_key].merge!(contact_submissions_to_merge)
    end

    formatted_submission_data = {}

    # first level key is the section_key, which we can ignore
    # second level is the actual submitted values
    cloned_submission_data.each do |section_key, section_value|
      section_value.each do |submitted_field_key, submitted_value|
        # key is in the format "formSubmissionDataRSTsection6736da0b-860e-43e6-9823-86c7d6562f1e|RBc2683830-8fe1-4979
        # -bd54-d6c993f3148c|building_project_value"
        # The requirement_block_id is in the format |RB{id}|, so the id in the example is c2683830-8fe1-4979-bd54-d6c993f3148c
        submitted_field_key_split = submitted_field_key.split("|RB")

        next unless submitted_field_key_split.length > 1

        requirement_block_id = submitted_field_key_split.last.split("|").first

        requirement_block = get_requirement_block_json(requirement_block_id)

        next unless requirement_block.present?

        if !formatted_submission_data.key?(requirement_block["sku"])
          formatted_submission_data[requirement_block["sku"]] = {
            id: requirement_block["id"],
            requirement_block_code: requirement_block["sku"],
            name: requirement_block["name"],
            description: requirement_block["description"],
            requirements: [],
          }
        end

        requirement =
          requirement_block["requirements"].find do |req|
            req.dig("form_json", "key").ends_with?(submitted_field_key.split("|RB").last)
          end

        next unless requirement.present?

        formatted_value =
          if submitted_field_key.to_s.ends_with?("multi_contact")
            submitted_value.map do |contact_value|
              formatted_contact_value = {}

              contact_value.each do |contact_field_key, contact_field_value|
                contact_field_key_split = contact_field_key.split("|")

                next unless contact_field_key_split.length > 1

                formatted_key = contact_field_key_split.last

                formatted_contact_value[formatted_key] = contact_field_value
              end

              formatted_contact_value
            end
          else
            submitted_value
          end

        formatted_submission_data[requirement_block["sku"]][:requirements] << {
          id: requirement["id"],
          name: requirement["label"],
          requirement_code: requirement["requirement_code"],
          type: requirement["input_type"],
          value: formatted_value,
        }
      end
    end

    formatted_submission_data
  end

  def get_requirement_block_json(requirement_block_id)
    self.permit_application.template_version.requirement_blocks_json[requirement_block_id]
  end

  private
end
