class EarlyAccessRequirementTemplatePolicy < RequirementTemplatePolicy
  def resolve
    scope.where(type: EarlyAccessRequirementTemplate.name)
  end
end
