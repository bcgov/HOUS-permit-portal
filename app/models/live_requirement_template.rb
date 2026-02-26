class LiveRequirementTemplate < RequirementTemplate
  validate :validate_nickname_uniqueness

  scope :with_published_version, -> { joins(:published_template_version) }

  def visibility
    "live"
  end

  private

  def validate_nickname_uniqueness
    return if nickname.blank? || instance_of?(EarlyAccessRequirementTemplate)

    if LiveRequirementTemplate
         .where.not(id: id)
         .where(discarded_at: nil)
         .exists?(nickname: nickname)
      errors.add(:nickname, :taken)
    end
  end
end
