# Eager loading polymorphic associations for audits
class ApplicationAudit
  class ActivityFeedPreloader
    def self.call(audits)
      new(audits).call
    end

    def initialize(audits)
      @audits = audits
    end

    def call
      preload_permit_collaborations
      preload_permit_block_statuses
    end

    private

    def preload_permit_collaborations
      records =
        @audits
          .select { |a| a.auditable_type == "PermitCollaboration" }
          .map(&:auditable)
          .compact
      return if records.empty?

      ActiveRecord::Associations::Preloader.new(
        records: records,
        associations: {
          collaborator: :user,
          permit_application: %i[template_version]
        }
      ).call
    end

    def preload_permit_block_statuses
      records =
        @audits
          .select { |a| a.auditable_type == "PermitBlockStatus" }
          .map(&:auditable)
          .compact
      return if records.empty?

      ActiveRecord::Associations::Preloader.new(
        records: records,
        associations: {
          permit_application: %i[template_version]
        }
      ).call
    end
  end
end
