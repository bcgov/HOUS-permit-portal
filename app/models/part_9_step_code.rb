class Part9StepCode < StepCode
  has_many :checklists,
           class_name: "Part9StepCode::Checklist",
           foreign_key: :step_code_id,
           dependent: :destroy
  has_one :pre_construction_checklist,
          -> { where(stage: :pre_construction) },
          class_name: "Part9StepCode::Checklist",
          foreign_key: :step_code_id

  accepts_nested_attributes_for :pre_construction_checklist

  before_create :set_plan_fields
  validate :requires_plan_document

  after_create :process_h2k_files

  def primary_checklist
    pre_construction_checklist
  end

  def blueprint
    Part9StepCodeBlueprint
  end

  def step_requirements
    all =
      permit_application.jurisdiction.permit_type_required_steps.where(
        permit_type: permit_application.permit_type
      )
    all.customizations.any? ? all.customizations : all
  end

  def plan_out_of_date
    permit_application.step_code_plan_author != plan_author ||
      permit_application.step_code_plan_version != plan_version ||
      permit_application.step_code_plan_date != plan_date
  end

  def checklist_blueprint
    StepCode::Part9::ChecklistBlueprint
  end

  private

  def set_plan_fields
    return if permit_application.blank?

    assign_attributes(
      plan_author: permit_application.step_code_plan_author,
      plan_version: permit_application.step_code_plan_version,
      plan_date: permit_application.step_code_plan_date
    )
  end

  def requires_plan_document
    return if permit_application.blank?

    if permit_application.step_code_plan_document.blank?
      errors.add(
        :plan_version,
        "file is missing.  Please upload on the permit application first."
      )
      # EVENTUALLY BRING THIS LOGIC BACK ONCE WE DECIDE BEST WAY TO CONFIGURE IF A STEP CODE REQUIRES A SIGNED DOCUMENT.
      # elsif permit_application.step_code_plan_document.compliance_data.blank? ||
      #       permit_application.step_code_plan_document.compliance_data.empty?
      #   errors.add(:plan_version, "file is being verified for author and date.")
      # elsif permit_application.step_code_plan_document.compliance_data.dig("error")
      #   errors.add(:plan_version, "file uploaded failed to verify author and data due to an error with the serivce.")
    end
  end

  def process_h2k_files
    # Ensure pre_construction_checklist and its data_entries exist to avoid errors
    return unless pre_construction_checklist&.data_entries

    pre_construction_checklist.data_entries.each do |data_entry|
      if data_entry.h2k_file&.attached? # Check if h2k_file is present and attached (if using Active Storage)
        begin
          # Assuming h2k_file.read gives the XML content
          # You might need to adjust how you access the file content based on your setup (e.g., Active Storage, Shrine)
          xml_content = data_entry.h2k_file.download # For Active Storage, or .read if it's a direct file object
          StepCode::Part9::DataEntryFromHot2000.new(
            xml: Nokogiri.XML(xml_content),
            data_entry: data_entry
          ).call
        rescue => e
          # Log the error, but don't let it break the callback chain for other entries
          # or the entire transaction unless that's desired.
          Rails.logger.error "Error processing H2K file for DataEntry #{data_entry.id} in Part9StepCode #{id}: #{e.message}"
          # Optionally, add an error to the StepCode object if you want to surface this failure,
          # though after_create runs inside the transaction, so direct errors might not be ideal here.
          # errors.add(:base, "Failed to process H2K file for one of the data entries.")
        end
      end
    end
  end
end
