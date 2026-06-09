class PropertyInformationSubmissionContact < SubmissionContact
  def confirmation_subject_key
    "property_information_contact_confirm"
  end

  def confirmation_heading
    "Property information requests"
  end

  def confirmation_configured_feature
    "property information request notifications"
  end
end
