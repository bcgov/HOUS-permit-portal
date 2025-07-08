module StepCodeChecklistDelegates
  extend ActiveSupport::Concern

  DELEGATED_METHODS_WITH_DEFAULTS = {
    project_name: "Untitled Project",
    nickname: "Untitled Project",
    project_identifier: "N/A",
    project_address: "N/A",
    full_address: "N/A",
    jurisdiction_name: "N/A",
    pid: "N/A",
    building_permit_number: "N/A"
  }.freeze

  DELEGATED_METHODS_ALLOWING_NIL = %i[
    permit_date
    parent_type
    parent_id
    status
    newly_submitted_at
  ].freeze

  included do
    DELEGATED_METHODS_WITH_DEFAULTS.each do |method_name, default_value|
      define_method(method_name) do
        value = step_code.public_send(method_name) if step_code&.respond_to?(
          method_name
        )
        value || default_value
      end
    end

    DELEGATED_METHODS_ALLOWING_NIL.each do |method_name|
      define_method(method_name) do
        if step_code&.respond_to?(method_name)
          step_code.public_send(method_name)
        end
      end
    end
  end
end
