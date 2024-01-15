class TagPolicy < ApplicationPolicy
  def index?
    user.super_admin?
  end

  class Scope < Scope
    def resolve
      [] unless user.super_admin?

      scope.joins(:taggings).all
    end
  end
end
