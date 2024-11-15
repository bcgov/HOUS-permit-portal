class LiveRequirementTemplate < RequirementTemplate
  validate :unique_classification_for_undiscarded

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
end
