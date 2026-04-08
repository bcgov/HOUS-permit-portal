module ActivityFeedPreloader
  extend ActiveSupport::Concern

  class_methods do
    def preload_activity_feed(audits)
      preload_permit_collaborations(audits)
      preload_permit_block_statuses(audits)
    end

    private

    def preload_permit_collaborations(audits)
      records =
        audits
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

    def preload_permit_block_statuses(audits)
      records =
        audits
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
