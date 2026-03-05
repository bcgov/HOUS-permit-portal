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
      permit_project_id: permit_project_id_for_search
    }
  end

  # Derive project id for search indexing so activities can filter by permit_project_id.
  # Stored as string so ES term filter matches the controller's @permit_project.id.
  def permit_project_id_for_search
    project_id =
      case auditable_type
      when "PermitProject"
        auditable_id
      when "PermitApplication"
        PermitApplication.where(id: auditable_id).pick(:permit_project_id)
      else
        if associated_type == "PermitApplication" && associated_id.present?
          PermitApplication.where(id: associated_id).pick(:permit_project_id)
        end
      end
    project_id&.to_s
  end
end
