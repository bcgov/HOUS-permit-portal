class ActivityLogger
  def self.log_activity(user, feature_name, jurisdiction, action)
    user_activity = UserActivity.create!(
      user_id: user.id,
      feature_name: feature_name,
      jurisdiction: jurisdiction,
      action: action,
      timestamp: Time.current
    )
    user_activity.__elasticsearch__.index_document
  end
end
