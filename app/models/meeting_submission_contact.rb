class MeetingSubmissionContact < SubmissionContact
  def confirmation_subject_key
    "project_meeting_contact_confirm"
  end

  def confirmation_heading
    "Project meetings"
  end

  def confirmation_configured_feature
    "project meeting notifications"
  end

  def feature_enabled_attribute
    :project_meetings_enabled?
  end
end
