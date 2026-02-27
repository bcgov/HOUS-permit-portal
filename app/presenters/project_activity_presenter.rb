class ProjectActivityPresenter
  def self.format(audit, viewer:)
    {
      id: audit.id,
      description: format_description(audit, viewer),
      timestamp: audit.created_at,
      user_name: resolve_user_display_name(audit, viewer),
      jurisdiction_name: resolve_jurisdiction_name(audit),
      permit_application_id: resolve_permit_application_id(audit),
      permit_application_number: resolve_permit_application_number(audit),
      permit_name: resolve_permit_name(audit),
      requirement_block_id: resolve_requirement_block_id(audit)
    }
  end

  def self.format_description(audit, viewer)
    case audit.auditable_type
    when "PermitProject"
      format_permit_project_description(audit, viewer)
    when "PermitApplication"
      format_permit_application_description(audit, viewer)
    when "PermitCollaboration"
      format_permit_collaboration_description(audit, viewer)
    when "PermitBlockStatus"
      format_permit_block_status_description(audit, viewer)
    else
      "#{resolve_user_display_name(audit, viewer)} made a change"
    end
  end

  def self.resolve_user_display_name(audit, viewer)
    user = audit.user
    return "System" if user.blank?

    # Do not expose the individual's name to submitters when the user is jurisdiction staff.
    if viewer.present? && viewer.submitter? && user.jurisdiction_staff?
      jurisdiction = resolve_jurisdiction_for_audit(audit)
      return nil if jurisdiction.present? && user.member_of?(jurisdiction.id)
    end

    user.name
  end

  def self.resolve_jurisdiction_for_audit(audit)
    case audit.auditable_type
    when "PermitProject"
      audit.auditable&.jurisdiction
    when "PermitApplication"
      audit.auditable&.jurisdiction
    when "PermitCollaboration"
      audit.auditable&.permit_application&.jurisdiction
    when "PermitBlockStatus"
      audit.auditable&.permit_application&.jurisdiction
    end
  end

  def self.resolve_jurisdiction_name(audit)
    resolve_jurisdiction_for_audit(audit)&.qualified_name
  end

  def self.resolve_permit_application_id(audit)
    case audit.auditable_type
    when "PermitApplication"
      audit.auditable_id
    when "PermitCollaboration"
      audit.auditable&.permit_application_id
    when "PermitBlockStatus"
      audit.auditable&.permit_application_id
    end
  end

  def self.resolve_permit_application_number(audit)
    pa = resolve_permit_application(audit)
    pa&.number
  end

  def self.resolve_permit_name(audit)
    pa = resolve_permit_application(audit)
    pa&.nickname
  end

  def self.resolve_requirement_block_id(audit)
    case audit.auditable_type
    when "PermitCollaboration"
      audit.auditable&.assigned_requirement_block_id
    when "PermitBlockStatus"
      audit.auditable&.requirement_block_id
    end
  end

  # ─────────────────────────────────────────────────────────────────────────
  # Type-specific description formatters
  # ─────────────────────────────────────────────────────────────────────────

  def self.format_permit_project_description(audit, viewer)
    user_display = resolve_user_display_name(audit, viewer)
    case audit.action
    when "create"
      "#{user_display} created this project"
    when "update"
      changes = audit.audited_changes.to_h
      if changes.key?("full_address")
        "#{user_display} changed the project address"
      elsif changes.key?("title")
        "#{user_display} changed the project name"
      else
        "#{user_display} updated the project"
      end
    when "destroy"
      "#{user_display} removed the project"
    else
      "#{user_display} made a change to the project"
    end
  end

  def self.format_permit_application_description(audit, viewer)
    user_display = resolve_user_display_name(audit, viewer)
    permit_name = audit.auditable&.nickname || "permit"
    case audit.action
    when "create"
      "#{user_display} created permit #{permit_name}"
    when "update"
      changes = audit.audited_changes.to_h
      if changes.key?("status")
        new_status = Array(changes["status"]).last
        case new_status.to_s
        when "newly_submitted", "1"
          "#{user_display} submitted the application"
        when "resubmitted", "4"
          submitter_name = audit.auditable&.submitter&.name || user_display
          "#{submitter_name} resubmitted the application"
        when "revisions_requested", "3"
          "Revisions requested — sent to submitter"
        else
          "#{user_display} changed the application status"
        end
      elsif changes.key?("reference_number")
        ref = Array(changes["reference_number"]).last
        "Reference number #{ref} assigned"
      else
        "#{user_display} updated the application"
      end
    when "destroy"
      "#{user_display} removed permit #{permit_name}"
    else
      "#{user_display} made a change to the application"
    end
  end

  def self.format_permit_collaboration_description(audit, viewer)
    user_display = resolve_user_display_name(audit, viewer)
    collab = audit.auditable
    return "#{user_display} made a change" if collab.blank?

    permit_name = collab.permit_application&.nickname || "permit"
    case audit.action
    when "create"
      if collab.submission?
        if collab.delegatee?
          "#{user_display} set as designated submitter"
        else
          collaborator_name = collab.collaborator_name
          "#{user_display} invited #{collaborator_name} to #{permit_name}"
        end
      elsif collab.review?
        block_name =
          collab.assigned_requirement_block_name.presence || "requirement block"
        "#{user_display} assigned to #{block_name}"
      else
        "#{user_display} added a collaborator to #{permit_name}"
      end
    when "destroy"
      block_name =
        collab.assigned_requirement_block_name.presence || "requirement block"
      "#{user_display} unassigned from #{block_name}"
    else
      "#{user_display} made a change to collaboration"
    end
  end

  def self.format_permit_block_status_description(audit, viewer)
    user_display = resolve_user_display_name(audit, viewer)
    block_status = audit.auditable
    return "#{user_display} made a change" if block_status.blank?

    block_name =
      block_status.requirement_block_name.presence || "requirement block"
    case audit.action
    when "update"
      "#{user_display} changed status of #{block_name}"
    when "destroy"
      "#{user_display} removed status for #{block_name}"
    else
      "#{user_display} made a change to #{block_name}"
    end
  end

  def self.resolve_permit_application(audit)
    return audit.auditable if audit.auditable_type == "PermitApplication"
    if audit.auditable_type == "PermitCollaboration"
      return audit.auditable&.permit_application
    end
    if audit.auditable_type == "PermitBlockStatus"
      return audit.auditable&.permit_application
    end

    nil
  end
end
