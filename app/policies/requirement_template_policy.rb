class RequirementTemplatePolicy < ApplicationPolicy
  def show?
    return false unless user.present?

    user.super_admin? ||
      (
        record.early_access? &&
          user
            .template_version_previews
            .joins(:template_version)
            .where(
              template_versions: {
                requirement_template_id: record.id
              },
              discarded_at: nil
            )
            .where("template_version_previews.expires_at > ?", Time.current)
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

  def for_filter?
    true
  end

  def unschedule_template_version?
    create? && record.scheduled?
  end

  def invite_previewers?
    create? && record.early_access?
  end

  def create_draft?
    create?
  end

  def discard_draft?
    create?
  end

  def promote_draft?
    create?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
