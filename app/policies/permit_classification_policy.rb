class PermitClassificationPolicy < ApplicationPolicy
  def index?
    true
  end

  def permit_classification_options?
    index?
  end

  class Scope < Scope
    def resolve
      scope.enabled
    end
  end
end
