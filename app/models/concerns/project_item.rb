module ProjectItem
  extend ActiveSupport::Concern

  included do
    belongs_to :permit_project # Non-optional, will be validated by presence

    # Delegations to PermitProject for core project details
    delegate :title,
             :full_address,
             :pid,
             :pin,
             :jurisdiction,
             :permit_date,
             to: :permit_project,
             allow_nil: true # allow_nil should be false if permit_project is truly non-optional and always present

    delegate :qualified_name,
             :heating_degree_days,
             to: :jurisdiction,
             prefix: :jurisdiction, # Results in jurisdiction_name, jurisdiction_qualified_name, etc.
             allow_nil: true

    # Aliases for consistent naming
    alias_method :project_name, :title
    alias_method :project_address, :full_address
    alias_method :project_identifier, :pid

    # Ensure permit_project is present if it's meant to be non-optional.
    # This can also be handled at the database level or with model validations
    # on the including class if `allow_nil: true` is used above for resilience.
    # validates :permit_project, presence: true # Uncomment if strict presence is required by including models

    # Custom method for jurisdiction to ensure it safely accesses through permit_project
    # This is somewhat redundant if using delegate with allow_nil: true but can be kept for clarity
    # or if more complex logic were needed.
    def jurisdiction
      permit_project&.jurisdiction
    end
  end
end
