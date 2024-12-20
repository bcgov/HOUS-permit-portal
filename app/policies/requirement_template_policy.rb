class RequirementTemplatePolicy < ApplicationPolicy
  def show?
    return true if record.public?

    return false unless user.present?

    user.super_admin? ||
      (
        record.early_access? &&
          user
            .early_access_previews
            .where(
              early_access_requirement_template_id: record.id,
              discarded_at: nil
            )
            .where("expires_at > ?", Time.current)
            .exists?
      )
  end

  def create?
    user.super_admin?
  end

  def index?
    create?
  end

  def update?
    create?
  end

  def schedule?
    create?
  end

  def force_publish_now?
    create? && ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true"
  end

  def destroy?
    create?
  end

  def restore?
    create?
  end

  def copy?
    create?
  end

  def unschedule_template_version?
    create? && record.scheduled?
  end

  def invite_previewers?
    create? && record.early_access?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
