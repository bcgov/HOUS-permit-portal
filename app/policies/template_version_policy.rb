class TemplateVersionPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    !record.scheduled? || user.super_admin?
  end

  class Scope < Scope
    def resolve
      [] unless user.super_admin?

      scope
        .joins(requirement_template: :activity)
        .where(requirement_templates: { discarded_at: nil })
        .where(status: "published")
    end
  end
end
