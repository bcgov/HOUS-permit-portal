class EarlyAccessPreviewPolicy < RequirementTemplatePolicy
  def revoke_access?
    user.super_admin?
  end

  def unrevoke_access?
    revoke_access?
  end

  def extend_access?
    revoke_access?
  end
end
