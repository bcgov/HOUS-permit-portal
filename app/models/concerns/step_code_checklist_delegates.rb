module StepCodeChecklistDelegates
  extend ActiveSupport::Concern

  included do
    # Delegates from StepCodeBaseFields
    delegate :project_name,
             :nickname,
             :project_identifier,
             :project_address,
             :full_address,
             :jurisdiction_name,
             :permit_date,
             :parent_type,
             :parent_id,
             :pid,
             # Other common delegates (already in Part3StepCode::Checklist)
             :building_permit_number,
             :status,
             :newly_submitted_at,
             to: :step_code,
             allow_nil: true
  end
end
