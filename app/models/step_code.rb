class StepCode < ApplicationRecord
  belongs_to :parent, polymorphic: true

  def permit_application_parent
    parent if parent_type == "PermitApplication"
  end

  # Custom getters that prioritize local values, then delegate
  def project_name
    self[:project_name] || permit_application_parent&.nickname # PA uses nickname for project name context
  end
  alias_method :nickname, :project_name

  def project_address
    self[:project_address] || permit_application_parent&.full_address
  end
  alias_method :full_address, :project_address

  def jurisdiction_name
    # For jurisdiction_name, if step_code has its own, use it.
    # Otherwise, from PA parent. If PA parent also doesn't have it (shouldn't happen), then nil.
    self[:jurisdiction_name] || permit_application_parent&.jurisdiction_name
  end

  def project_identifier # Assuming PA doesn't have a direct 'project_identifier'. This would be step_code specific or from another source.
    # If permit_application_parent has a PID or similar that acts as an identifier, use it.
    # For now, this assumes project_identifier is primarily from the StepCode itself or not on PA.
    self[:project_identifier] || permit_application_parent&.pid # Example: using PA's PID if local is blank
  end
  alias_method :pid, :project_identifier

  def permit_date # Assuming PA doesn't have 'permit_date'. This is specific to step_code's context.
    # If PA has a relevant date (e.g. submitted_at), you could delegate to that as a fallback.
    self[:permit_date] || permit_application_parent&.submitted_at # Example: using PA's submitted_at if local is blank
  end

  # Original delegates for attributes ONLY on PermitApplication (or that don't have local overrides)
  delegate :number,
           to: :permit_application_parent,
           prefix: :building_permit,
           allow_nil: true
  delegate :submitter,
           # :nickname, # Handled by custom getter project_name
           # :jurisdiction_name, # Handled by custom getter
           # :full_address, # Handled by custom getter project_address
           # :pid, # Potentially used by project_identifier getter
           :newly_submitted_at,
           :status,
           :jurisdiction_heating_degree_days,
           to: :permit_application_parent,
           allow_nil: true

  def builder
    "" #replace with a config on permit application
  end

  def primary_checklist
    raise NotImplementedError,
          "Subclasses must implement the primary_checklist method"
  end

  def blueprint
    raise NotImplementedError, "Subclasses must implement the blueprint method"
  end

  def checklist_blueprint
    raise NotImplementedError,
          "Subclasses must implement the checklist_blueprint method"
  end
end
