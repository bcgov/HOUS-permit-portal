class TemplateVersionPolicy < ApplicationPolicy
  def show?
    !record.scheduled? || user.super_admin?
  end
end
