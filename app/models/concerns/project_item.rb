module ProjectItem
  extend ActiveSupport::Concern

  included do
    belongs_to :permit_project # Non-optional
    accepts_nested_attributes_for :permit_project

    # Delegations to PermitProject
    delegate :name,
             :address,
             :identifier,
             :project_start_date,
             :pid,
             :pin,
             to: :permit_project,
             allow_nil: true # Allows attributes on permit_project to be nil

    # jurisdiction_name will now come from permit_project.jurisdiction.name
    # Delegate jurisdiction itself, and then specific jurisdiction attributes as needed
    delegate :jurisdiction, to: :permit_project
    delegate :name,
             :qualified_name,
             :heating_degree_days,
             to: :jurisdiction,
             prefix: true,
             allow_nil: true

    # Aliases for delegated PermitProject attributes
    alias_method :project_name, :name
    alias_method :nickname, :name

    alias_method :project_address, :address
    alias_method :full_address, :address # This now points to permit_project.address

    # project_identifier still maps to permit_project.identifier
    alias_method :project_identifier, :identifier
    # pid now correctly maps to permit_project.pid via direct delegation above
    # pin will be mapped if added to delegate above

    alias_method :permit_date, :project_start_date

    def jurisdiction
      permit_project&.jurisdiction
    end
  end
end
