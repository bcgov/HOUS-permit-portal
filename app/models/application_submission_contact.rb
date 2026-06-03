class ApplicationSubmissionContact < SubmissionContact
  validate :only_one_default_per_jurisdiction

  def confirmation_subject_key
    "submission_contact_confirm"
  end

  def confirmation_heading
    "Submission Inbox"
  end

  def confirmation_configured_feature
    "your Building Permit Hub Submission inbox"
  end

  private

  def only_one_default_per_jurisdiction
    return unless default?

    existing_default =
      ApplicationSubmissionContact
        .where(jurisdiction_id: jurisdiction_id, default: true)
        .where.not(id: id)

    if existing_default.exists?
      errors.add(
        :default,
        "another default contact already exists for this jurisdiction"
      )
    end
  end
end
