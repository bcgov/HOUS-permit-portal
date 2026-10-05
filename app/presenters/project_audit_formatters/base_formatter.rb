module ProjectAuditFormatters
  class BaseFormatter
    include ChangesHelper

    attr_reader :audit, :viewer

    def initialize(audit, viewer)
      @audit = audit
      @viewer = viewer
    end

    def description
      I18n.t("project_audit.fallback.generic_change", user: user_display)
    end

    def permit_application
      nil
    end

    def jurisdiction
      audit.auditable&.jurisdiction
    end

    def permit_application_id
      nil
    end

    def requirement_block_id
      nil
    end

    def resolve_jurisdiction
      jurisdiction_via_auditable = jurisdiction
      return jurisdiction_via_auditable if jurisdiction_via_auditable.present?

      resolve_jurisdiction_via_associated
    end

    private

    def user_display
      actor = audit.user.presence || audit.try(:username)
      return "System" if actor.blank?
      # Audited stores partner/system actors as a username string, not a User.
      return actor.to_s unless actor.respond_to?(:name)

      if viewer&.submitter? && actor.try(:jurisdiction_staff?)
        jurisdiction = resolve_jurisdiction
        if jurisdiction.present? && actor.member_of?(jurisdiction.id)
          return jurisdiction.qualified_name
        end
      end

      actor.name
    end

    def resolve_jurisdiction_via_associated
      case audit.associated_type
      when "PermitProject", "PermitApplication"
        audit.associated&.jurisdiction
      end
    end

    def changes
      @changes ||= (audit.audited_changes || {}).to_h
    end

    def discard?
      changes.key?("discarded_at")
    end
  end
end
