class NotePolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.none unless user

      clauses = ["permit_projects.owner_id = :uid"]
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
