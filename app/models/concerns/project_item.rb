module ProjectItem
  extend ActiveSupport::Concern

  class_methods do
    def has_parent(parent_association)
      # Define an instance method rather than using alias_attribute since
      # alias_attribute only supports real DB attributes (not associations).
      # Using define_method also avoids ordering issues with when the
      # association is declared on the including class.
      define_method(:parent) do
        reflection = self.class.reflect_on_association(parent_association)
        foreign_key = reflection&.foreign_key || "#{parent_association}_id"

        parent_association_instance = association(parent_association)

        if parent_association_instance.loaded?
          parent_association_instance.reader
        elsif !has_attribute?(foreign_key)
          nil
        else
          public_send(parent_association)
        end
      end
    end
  end

  included do
    unless self < ActiveRecord::Base
      raise TypeError, "ProjectItem can only be included in ActiveRecord models"
    end

    belongs_to :jurisdiction, optional: true # Added for direct association
    belongs_to :permit_type, optional: true # Added for direct association
    has_one :owner, through: :permit_project

    after_commit :reindex_permit_project

    # Delegations to PermitProject for core project details
    delegate :permit_date, to: :permit_project, allow_nil: true # allow_nil should be false if permit_project is truly non-optional and always present
    delegate :title, to: :permit_project, prefix: true, allow_nil: true

    delegate :qualified_name,
             :heating_degree_days,
             :name,
             to: :jurisdiction,
             prefix: :jurisdiction, # Results in jurisdiction_name, jurisdiction_qualified_name, etc.
             allow_nil: true

    # Custom getters that prioritize permit_project but fall back to self
    # Canonical title getter; prefers parent when present
    def title
      parent&.title || self[:title]
    end

    def full_address
      parent&.full_address || self[:full_address]
    end

    def pid
      parent&.pid || self[:pid]
    end

    def pin
      parent&.pin || self[:pin]
    end

    def reference_number
      parent&.reference_number || self[:reference_number]
    end

    def permit_type
      parent&.permit_type || super
    end

    def permit_type_id
      parent&.permit_type_id || super
    end

    def phase
      parent&.phase || self[:phase]
    end

    # Custom method for jurisdiction to ensure it safely accesses through permit_project
    # or falls back to its own direct association.
    def jurisdiction
      parent&.jurisdiction || super
    end

    def jurisdiction_id
      parent&.jurisdiction_id || super
    end

    # Prefer parent permit_date when present, otherwise use standalone value
    def permit_date
      parent&.permit_date || self[:permit_date]
    end

    def latitude
      parent&.latitude || (self[:latitude] if self.has_attribute?(:latitude))
    end

    def longitude
      parent&.longitude || (self[:longitude] if self.has_attribute?(:longitude))
    end

    def coordinates
      return longitude, latitude if longitude && latitude

      nil
    end

    private

    def reindex_permit_project
      return unless permit_project

      permit_project.reload
      permit_project.reindex
    end
  end
end
