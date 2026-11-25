class NotePolicy < ApplicationPolicy
  # Project notes and meeting notes. Full and Expanded see both
  # (view_project_notes? and manage_meetings? are the same levels).
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = [ProjectAccess.member_sql(:view_project_notes?)]
      values = { uid: user.id }

      if user.review_staff?
        clauses << "permit_projects.jurisdiction_id IN (:jur_ids)"
        values[:jur_ids] = user.jurisdictions.pluck(:id)
      end

      scope
        .joins(:permit_project)
        .where(permit_projects: { sandbox_id: sandbox&.id })
        .where(clauses.map { |clause| "(#{clause})" }.join(" OR "), values)
        .distinct
    end
  end
end
