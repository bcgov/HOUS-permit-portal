# frozen_string_literal: true

class RequirementPolicy < ApplicationPolicy
  # Placement-level question-bank operations (link / detach / fork) are a
  # steward / super-admin authoring surface only, mirroring RequirementBlock.
  def link_question_definition?
    user.super_admin?
  end

  def detach_question_definition?
    link_question_definition?
  end

  def fork_question_definition?
    link_question_definition?
  end

  class Scope < Scope
    def resolve
      user&.super_admin? ? scope.all : scope.none
    end
  end
end
