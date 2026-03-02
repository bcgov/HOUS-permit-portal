class ApplicationAudit < Audited::Audit
  searchkick searchable: %i[
               omniauth_username
               permit_application_nickname
               jurisdiction_name
             ],
             word_start: %i[omniauth_username jurisdiction_name],
             word_middle: %i[permit_application_nickname],
             text_start: %i[jurisdiction_name]

  def search_data
    {
      auditable_type: auditable_type,
      auditable_id: auditable_id,
      associated_type: associated_type,
      associated_id: associated_id,
      user_id: user_id,
      action: action,
      comment: comment,
      created_at: created_at,
      omniauth_username: omniauth_username_for_search,
      permit_application_nickname: permit_application_nickname_for_search,
      jurisdiction_name: jurisdiction_name_for_search,
      # Resolved project ID regardless of whether this audit is directly on a
      # PermitProject or on a child record associated_with one. This lets us
      # run a single Searchkick query scoped to a project and get the full
      # unified activity feed (project + all child PermitApplication audits).
      permit_project_id: permit_project_id_for_search
    }
  end

  private

  def omniauth_username_for_search
    if user && user.respond_to?(:omniauth_username)
      user.omniauth_username
    else
      username
    end
  end

  def permit_application_for_search
    return auditable if auditable_type == "PermitApplication"
    return associated if associated_type == "PermitApplication"
    if auditable.respond_to?(:permit_application)
      return auditable.permit_application
    end

    nil
  end

  def permit_application_nickname_for_search
    pa = permit_application_for_search
    return nil unless pa

    pa.nickname
  end

  def jurisdiction_name_for_search
    pa = permit_application_for_search
    return pa.jurisdiction_name if pa.respond_to?(:jurisdiction_name)

    if auditable_type == "PermitProject" && auditable.respond_to?(:jurisdiction)
      return auditable.jurisdiction&.qualified_name
    end
    if associated_type == "PermitProject" &&
         associated.respond_to?(:jurisdiction)
      return associated.jurisdiction&.qualified_name
    end

    nil
  end

  # When the audit is directly on a PermitProject, the project IS the auditable.
  # When it's on a child (e.g. PermitApplication with `associated_with: :permit_project`),
  # the project is stored in associated_id. This unifies both cases into a single
  # filterable field so we can query "all audits for project X" in one shot.
  def permit_project_id_for_search
    return auditable_id if auditable_type == "PermitProject"
    return associated_id if associated_type == "PermitProject"

    nil
  end
end
