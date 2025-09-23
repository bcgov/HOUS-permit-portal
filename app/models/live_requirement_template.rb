class LiveRequirementTemplate < RequirementTemplate
  before_validation :set_nickname_from_label
  validate :unique_classification_for_undiscarded
  validate :validate_nickname_uniqueness

  scope :with_published_version, -> { joins(:published_template_version) }

  def visibility
    "live"
  end

  def unique_classification_for_undiscarded
    return unless discarded_at.nil?

    existing_record =
      LiveRequirementTemplate
        .where.not(id: id)
        .find_by(
          permit_type_id: permit_type_id,
          activity_id: activity_id,
          first_nations: first_nations,
          discarded_at: nil
        )

    if existing_record.present?
      if existing_record.present? && existing_record.id != id
        errors.add(
          :base,
          I18n.t(
            "activerecord.errors.models.requirement_template.nonunique_classification"
          )
        )
      end
    end
  end

  private

  def set_nickname_from_label
    self.nickname = label if nickname.blank? && label.present?
  end

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
