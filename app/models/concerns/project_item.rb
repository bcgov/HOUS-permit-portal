module ProjectItem
  extend ActiveSupport::Concern

  class_methods do
    def has_parent(parent_association)
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

    belongs_to :jurisdiction, optional: true
    has_one :owner, through: :permit_project

    after_commit :reindex_permit_project

    delegate :permit_date, to: :permit_project, allow_nil: true
    delegate :title, to: :permit_project, prefix: true, allow_nil: true

    delegate :qualified_name,
             :heating_degree_days,
             :name,
             to: :jurisdiction,
             prefix: :jurisdiction,
             allow_nil: true

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

    def phase
      parent&.phase || self[:phase]
    end

    def jurisdiction
      parent&.jurisdiction || super
    end

    def jurisdiction_id
      parent&.jurisdiction_id || super
    end

    # Sandbox lives on the parent project. Project items no longer carry
    # their own sandbox_id column; always defer to the parent.
    def sandbox
      parent&.sandbox
    end

    def sandbox_id
      parent&.sandbox_id
    end

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
