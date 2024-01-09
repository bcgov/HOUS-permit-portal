class SubDistrictPolicy < JurisdictionPolicy
  class Scope < Scope
    def resolve
      scope.all
    end
  end
end
