class PermitClassificationPolicy < ApplicationPolicy
  def index?
    true
  end

  def permit_type_options?
    index?
  end

  def activity_options?
    index?
  end

  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
