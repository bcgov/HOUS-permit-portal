class RequirementTemplatePolicy < ApplicationPolicy
  def index?
    user.super_admin? || user.review_manager? || user.regional_review_manager?
  end

  def show?
    index?
  end

  def create?
    user.super_admin?
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

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
