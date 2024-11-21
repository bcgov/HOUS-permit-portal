class StepCode::Part3::ChecklistBlueprint < Blueprinter::Base
  identifier :id

  fields :section_completion_status

  fields :jurisdiction_name
  field :pid, name: :project_identifier
  field :nickname, name: :project_name
  field :full_address, name: :project_address
  field :permit_date do |checklist, _options|
    checklist.newly_submitted_at&.strftime("%b%e, %Y")
  end

  field :status, name: :project_stage

  field :building_code_version do |checklist, _options|
    if checklist.newly_submitted_at.present?
      Constants::Part3StepCode::BUILDING_CODE_VERSION_LOOKUP
        .find { |_, date| checklist.newly_submitted_at <= date }
        &.first
    else
      Constants::Part3StepCode::BUILDING_CODE_VERSION_LOOKUP
        .max_by { |_, date| date }
        &.first
    end
  end
end
