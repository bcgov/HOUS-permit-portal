module ProjectItem
  extend ActiveSupport::Concern

  class_methods do
    def has_parent(parent_association)
      alias_attribute :parent, parent_association
    end
  end

  included do
    belongs_to :jurisdiction, optional: true # Added for direct association
    has_one :owner, through: :permit_project

    after_commit :reindex_permit_project

    # Delegations to PermitProject for core project details
    delegate :title, :permit_date, to: :permit_project, allow_nil: true # allow_nil should be false if permit_project is truly non-optional and always present

    delegate :qualified_name,
             :heating_degree_days,
             :name,
             to: :jurisdiction,
             prefix: :jurisdiction, # Results in jurisdiction_name, jurisdiction_qualified_name, etc.
             allow_nil: true

    # Aliases for consistent naming
    alias_method :project_name, :title

    # Custom getters that prioritize permit_project but fall back to self
    def full_address
      parent&.full_address || read_attribute(:full_address)
    end

    def pid
      parent&.pid || read_attribute(:pid)
    end

    def pin
      parent&.pin || read_attribute(:pin)
    end

    def project_identifier
      permit_project&.id
    end

    # Custom method for jurisdiction to ensure it safely accesses through permit_project
    # or falls back to its own direct association.
    def jurisdiction
      parent&.jurisdiction || super
    end

    private

    def reindex_permit_project
      return unless permit_project

      permit_project.reload
      permit_project.reindex
    end
  end
end
