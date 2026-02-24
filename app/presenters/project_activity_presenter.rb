class ProjectActivityPresenter
  # [AUDITED VIBES TODO]: Implement format(audit, viewer:)
  #
  # Converts a raw Audited::Audit record into a display-ready hash for the
  # activity feed. The audit object gives you:
  #   audit.auditable_type  - e.g. "PermitProject", "PermitApplication", etc.
  #   audit.auditable_id    - the record's ID
  #   audit.auditable       - the actual record (may be nil if deleted)
  #   audit.action          - "create", "update", or "destroy"
  #   audit.audited_changes - hash of changed fields { "field" => [old, new] }
  #   audit.user            - the User who made the change (auto-set by Audited)
  #   audit.created_at      - when it happened
  #
  # ═══════════════════════════════════════════════════════════════════════
  # PROJECT-LEVEL TRIGGERS (auditable_type: "PermitProject")
  # ═══════════════════════════════════════════════════════════════════════
  #
  # action: "create"
  #   → "[Username] created this project"
  #   → Access: All
  #
  # action: "update", changed: "full_address"
  #   → "[Username] changed the project address"
  #   → Access: All
  #
  # action: "update", changed: "title"
  #   → "[Username] changed the project name"
  #   → Access: All
  #
  # ═══════════════════════════════════════════════════════════════════════
  # PERMIT-LEVEL TRIGGERS (auditable_type: "PermitApplication")
  # ═══════════════════════════════════════════════════════════════════════
  #
  # action: "create"
  #   → "[Username] created permit [Permit Name]"
  #   → Access: All
  #
  # action: "update", changed: "status" (various transitions)
  #   → "Application submitted"          (status → newly_submitted, Access: All)
  #   → "[Username] submitted the application" (Access: All)
  #   → "[Submitter Name] resubmitted the application" (status → resubmitted, Access: All)
  #   → "Revisions requested — sent to submitter" (status → revisions_requested, Access: All)
  #
  # action: "update", changed: "reference_number"
  #   → "Reference number [REF-XXXX] assigned"
  #   → Access: All (nice to have)
  #
  # ═══════════════════════════════════════════════════════════════════════
  # COLLABORATION TRIGGERS (auditable_type: "PermitCollaboration")
  # ═══════════════════════════════════════════════════════════════════════
  #
  # action: "create" (submission, assignee)
  #   → "[Username] invited [Collaborator Name] to [Permit Name]"
  #   → Access: Submitter
  #
  # action: "create" (submission, delegatee)
  #   → "[Username] set as designated submitter"
  #   → Access: All
  #
  # action: "create" (review, assignee)
  #   → "[Username] assigned to [Requirement Block Name]"
  #   → Access: Submitter (permit-level) / Reviewer/RM/RRM (reviewer-side)
  #
  # action: "destroy"
  #   → "[Username] unassigned from [Requirement Block Name]"
  #   → Access: Submitter (permit-level) / Reviewer/RM/RRM (reviewer-side)
  #
  # ═══════════════════════════════════════════════════════════════════════
  # BLOCK STATUS TRIGGERS (auditable_type: "PermitBlockStatus")
  # ═══════════════════════════════════════════════════════════════════════
  #
  # action: "update", changed: "status"
  #   → "[Username] changed status of [Requirement Block Name]"
  #   → Access: Submitter
  #
  # ═══════════════════════════════════════════════════════════════════════
  # PRIVACY RULES
  # ═══════════════════════════════════════════════════════════════════════
  #
  # If viewer is a submitter:
  #   - Jurisdiction-side actions (review collaborations, reviewer status changes)
  #     should display the acting user as "[Jurisdiction Name]" instead of
  #     the individual reviewer's name.
  #
  # If viewer is a Reviewer / Review Manager:
  #   - No privacy restrictions. Show all submitter and team member names.
  #
  # ═══════════════════════════════════════════════════════════════════════

  def self.format(audit, viewer:)
    # [AUDITED VIBES TODO]: Replace this stub with real formatting logic
    #
    # Returns a hash like:
    # {
    #   id: audit.id,
    #   description: "Sarah Jones assigned to Structural Requirements",
    #   timestamp: audit.created_at,
    #   user_name: resolve_user_name(audit, viewer),
    #   permit_application_id: resolve_permit_application_id(audit),
    #   permit_application_number: resolve_permit_application_number(audit),
    #   permit_name: resolve_permit_name(audit),
    #   requirement_block_id: nil  # bonus deep-linking
    # }
    {
      id: audit.id,
      description: "[AUDITED VIBES TODO]: format this audit",
      timestamp: audit.created_at,
      user_name: audit.user&.name || "System",
      permit_application_id: nil,
      permit_application_number: nil,
      permit_name: nil,
      requirement_block_id: nil
    }
  end

  # [AUDITED VIBES TODO]: Helper to resolve user display name with privacy rules
  # def self.resolve_user_name(audit, viewer)
  #   if viewer is submitter && audit was by jurisdiction staff
  #     return audit.auditable.jurisdiction.name (or similar)
  #   end
  #   audit.user&.name || "System"
  # end

  # [AUDITED VIBES TODO]: Helper to resolve permit application from nested associations
  # def self.resolve_permit_application_id(audit)
  #   case audit.auditable_type
  #   when "PermitApplication" then audit.auditable_id
  #   when "PermitCollaboration" then audit.auditable&.permit_application_id
  #   when "PermitBlockStatus" then audit.auditable&.permit_application_id
  #   else nil
  #   end
  # end
end
