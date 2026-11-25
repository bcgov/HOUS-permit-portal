module ProjectItem
  extend ActiveSupport::Concern

  # Parent project wins when one is present, including a live (nil) sandbox.
  # Standalone rows fall back to their own sandbox_id column.
  module SandboxResolution
    def sandbox
      return parent.sandbox if parent.present?
      return super if has_attribute?(:sandbox_id)

      nil
    end

    def sandbox_id
      return parent.sandbox_id if parent.present?
      return super if has_attribute?(:sandbox_id)

      nil
    end
  end

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

    prepend SandboxResolution

    after_commit :reindex_permit_project
    before_save :keep_standalone_sandbox

    delegate :permit_date, to: :permit_project, allow_nil: true
    delegate :title, to: :permit_project, prefix: true, allow_nil: true

    delegate :qualified_name,
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

    def default_jurisdiction_heating_degree_days
      rows = jurisdiction&.jurisdiction_heating_degree_days
      return unless rows&.one?

      rows.first.heating_degree_days
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

    # Attached rows take sandbox from the parent. Detach copies that sandbox
    # onto the row so the standalone record stays in the same training sandbox.
    def keep_standalone_sandbox
      return unless has_attribute?(:sandbox_id)
      return unless has_attribute?(:permit_application_id)
      return unless will_save_change_to_permit_application_id?

      if permit_application_id.present?
        self.sandbox_id = nil
      else
        previous =
          PermitApplication.find_by(id: permit_application_id_in_database)
        self.sandbox_id = previous&.sandbox_id
      end
    end
  end
end
