# frozen_string_literal: true

module Qa
  module StepCodeAutofillSupport
    module_function

    def ensure_jurisdiction!(step_code)
      jurisdiction = step_code.jurisdiction
      return jurisdiction if jurisdiction.present?

      jurisdiction = SubDistrict.order(:created_at).first
      if jurisdiction.blank?
        step_code.errors.add(
          :jurisdiction,
          "must be set before QA autofill can continue"
        )
        raise ActiveRecord::RecordInvalid, step_code
      end

      if (project = step_code.permit_application&.permit_project)
        project.update!(jurisdiction: jurisdiction)
      else
        step_code.update!(jurisdiction_id: jurisdiction.id)
      end

      step_code.reload
      jurisdiction
    end

    def apply_step_code_project_attributes!(
      step_code,
      attributes,
      validate: true
    )
      permit_application = step_code.permit_application
      project_attributes = attributes.dup

      if permit_application
        project_attributes[
          :jurisdiction_id
        ] ||= permit_application.jurisdiction_id
        project_attributes[:permit_date] ||= permit_application.permit_date

        if (project = permit_application.permit_project)
          updates = { full_address: project_attributes[:full_address] }
          updates[:pid] = project_attributes[:pid] if project_attributes[
            :pid
          ].present? && project.pid.blank?
          if project_attributes[:jurisdiction_id].present? &&
               project.jurisdiction_id.blank?
            updates[:jurisdiction_id] = project_attributes[:jurisdiction_id]
          end
          project.update!(updates)
        end

        project_attributes.delete(:pid)
      else
        ensure_jurisdiction!(step_code) if step_code.jurisdiction.blank?
        project_attributes[:jurisdiction_id] ||= step_code.jurisdiction_id
      end

      if validate
        step_code.update!(project_attributes)
      else
        step_code.assign_attributes(project_attributes)
        step_code.save!(validate: false)
      end
    end
  end
end
