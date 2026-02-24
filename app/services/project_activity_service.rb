class ProjectActivityService
  DEFAULT_PER_PAGE = 20

  # [AUDITED VIBES TODO]: Implement fetch_project_activities
  #
  # This is the main entry point for the activity feed. It should:
  #
  # 1. Query Audited::Audit for all audits scoped to the given project:
  #    - Direct audits on the PermitProject itself (auditable_type: "PermitProject")
  #    - Associated audits from PermitApplication (associated_type: "PermitProject")
  #    - Associated audits from PermitCollaboration & PermitBlockStatus
  #      (associated_type: "PermitApplication" where the permit_application
  #       belongs to this project)
  #
  # 2. Order by created_at DESC (newest first)
  #
  # 3. Paginate with Kaminari (.page(page).per(per_page))
  #
  # 4. Format each audit using ProjectActivityPresenter.format(audit, viewer:)
  #
  # 5. Apply privacy rules based on viewer role:
  #    - Submitter viewing: jurisdiction-side actions show as "[Jurisdiction Name]"
  #    - Reviewer/RM viewing: no privacy restrictions
  #    See: Privacy & Visibility Rules in the Activity Feed spec
  #
  # 6. Return a hash with :activities (array of formatted entries) and
  #    :meta (pagination metadata for the controller to pass through)
  #
  # Example query approach:
  #   Audited::Audit.where(
  #     "(auditable_type = 'PermitProject' AND auditable_id = ?) OR " \
  #     "(associated_type = 'PermitProject' AND associated_id = ?)",
  #     permit_project.id, permit_project.id
  #   ).order(created_at: :desc).page(page).per(per_page)
  #
  # For deeper nested associations (PermitCollaboration -> PermitApplication -> PermitProject),
  # you may need a JOIN or subquery to resolve the project chain.
  #
  # Returns:
  #   {
  #     activities: [{ id:, description:, timestamp:, user_name:, permit_application_id:, ... }],
  #     meta: { current_page:, total_pages:, total_count:, per_page: }
  #   }

  def self.fetch_project_activities(
    permit_project,
    viewer:,
    page: 1,
    per_page: DEFAULT_PER_PAGE
  )
    # [AUDITED VIBES TODO]: Replace this stub with real implementation
    {
      activities: [],
      meta: {
        current_page: page,
        total_pages: 0,
        total_count: 0,
        per_page: per_page
      }
    }
  end

  # [AUDITED VIBES TODO]: Implement fetch_recent_activities for the overview page
  # Returns the 5 most recent activities (no pagination needed)
  def self.fetch_recent_activities(permit_project, viewer:, limit: 5)
    # [AUDITED VIBES TODO]: Replace this stub with real implementation
    []
  end
end
