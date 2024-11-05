class EarlyAccessPreviewPolicy < RequirementTemplatePolicy
  def revoke?
    user.super_admin?
  end

  def unrevoke?
    revoke?
  end

  def extend?
    revoke?
  end
end
