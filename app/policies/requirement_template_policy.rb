class RequirementTemplatePolicy < ApplicationPolicy
  def show?
    return false unless user.present?

    user.super_admin?
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
    create?
  end

  def create_draft?
    create?
  end

  def discard_draft?
    create?
  end

  def promote_draft?
    create? && record.draft_template_version.present?
  end

  def force_publish_draft?
    create? && ENV["ENABLE_TEMPLATE_FORCE_PUBLISH"] == "true" &&
      record.draft_template_version.present?
  end

  def update_jurisdiction_availabilities?
    create?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
