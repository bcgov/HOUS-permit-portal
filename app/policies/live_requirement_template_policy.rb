class LiveRequirementTemplatePolicy < RequirementTemplatePolicy
  def resolve
    # Ensure only LiveRequirementTemplate records are returned
    scope.where(type: LiveRequirementTemplate.name)
  end
end
