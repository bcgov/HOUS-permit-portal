class LiveRequirementTemplate < RequirementTemplate
  validate :unique_classification_for_undiscarded, on: :create

  def visibility
    "live"
  end

  def unique_classification_for_undiscarded
    existing_record =
      LiveRequirementTemplate.find_by(
        permit_type_id: permit_type_id,
        activity_id: activity_id,
        first_nations: first_nations,
        discarded_at: nil
      )
    if existing_record.present?
      errors.add(
        :base,
        I18n.t(
          "activerecord.errors.models.requirement_template.nonunique_classification"
        )
      )
    end
  end
end
