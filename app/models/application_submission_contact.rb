class ApplicationSubmissionContact < SubmissionContact
  def confirmation_subject_key
    "submission_contact_confirm"
  end

  def confirmation_heading
    "Submission Inbox"
  end

  def confirmation_configured_feature
    "your Building Permit Hub Submission inbox"
  end

  def feature_enabled_attribute
    :inbox_enabled?
  end
end
