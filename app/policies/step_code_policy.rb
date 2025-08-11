class StepCodePolicy < ApplicationPolicy
  def index?
    record.creator == user
  end

  def download_step_code_summary_csv?
    user.super_admin?
  end

  def download_step_code_metrics_csv?
    user.super_admin?
  end

  def create?
    user.present?
  end

  def destroy?
    record.submitter == user
  end

  def show?
    return false unless user

    return true if user == record.creator

    return true if record.permit_application&.submitter == user

    if user.review_staff? &&
         user.member_of?(record.permit_application&.jurisdiction)
      return true
    end

    false
  end

  def update?
    return false unless user

    return true if user == record.creator

    return true if record.permit_application.submitter == user

    # TODO: ALLOW COLLABORATORS TO UPDATE IF THEY ARE ASSIGNED TO THE STEP CODE BLOCK
    if (record.permit_application.collaborators.include?(user) && false)
      return true
    end

    false
  end

  class Scope < Scope
    # NOTE: Be explicit about which records you allow access to!
    def resolve
      # A user can see step codes they created OR those linked to a permit application they can access
      # Submitters see their own; reviewers see those in their sandbox and jurisdiction; super_admin sees all.
      return scope.all if user.super_admin?

      # Join through permit_application where user is submitter or collaborator
      permitted_ids =
        PermitApplication
          .left_joins(:collaborators)
          .where(
            "permit_applications.submitter_id = :uid OR collaborators.user_id = :uid",
            uid: user.id
          )
          .select(:id)

      scoped =
        scope.left_joins(:permit_application).where(
          "step_codes.creator_id = :uid OR permit_applications.id IN (:pa_ids)",
          uid: user.id,
          pa_ids: permitted_ids
        )

      if sandbox.present?
        scoped = scoped.where(permit_applications: { sandbox_id: sandbox.id })
      end

      scoped.distinct
    end
  end
end
