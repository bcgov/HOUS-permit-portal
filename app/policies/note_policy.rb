class NotePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = ["permit_projects.owner_id = :uid"]
      values = { uid: user.id }

      if user.review_staff?
        review_clauses = [
          "permit_projects.jurisdiction_id IN (:jur_ids)",
          (
            if sandbox.present?
              "permit_projects.sandbox_id = :sandbox_id"
            else
              "permit_projects.sandbox_id IS NULL"
            end
          )
        ]

        clauses << review_clauses.join(" AND ")
        values[:jur_ids] = user.jurisdictions.pluck(:id)
        values[:sandbox_id] = sandbox.id if sandbox.present?
      end

      scope
        .for_project_meetings
        .joins(
          "INNER JOIN project_meetings ON project_meetings.id = notes.noteable_id"
        )
        .joins(
          "INNER JOIN permit_projects ON permit_projects.id = project_meetings.permit_project_id"
        )
        .where(clauses.map { |clause| "(#{clause})" }.join(" OR "), values)
        .distinct
    end
  end
end
