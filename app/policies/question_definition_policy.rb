# frozen_string_literal: true

class QuestionDefinitionPolicy < ApplicationPolicy
  # The question bank is a steward / super-admin authoring surface only.
  def show?
    user.super_admin?
  end

  def index?
    show?
  end

  def create?
    show?
  end

  def update?
    show?
  end

  def destroy?
    create?
  end

  def restore?
    destroy?
  end

  def where_used?
    show?
  end

  def dedup?
    show?
  end

  class Scope < Scope
    def resolve
      user&.super_admin? ? scope.all : scope.none
    end
  end
end
