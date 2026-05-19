class TemplateVersionFeedbackService
  # Creates feedback on a draft template version.
  # Raises if the version is not a draft.
  def self.create_feedback!(template_version, user:, body:, sentiment: :comment)
    unless template_version.draft?
      raise TemplateVersionDraftError,
            "Feedback can only be added to early access versions"
    end

    feedback =
      template_version.template_version_feedbacks.build(
        user: user,
        body: body,
        sentiment: sentiment
      )

    unless feedback.save
      raise TemplateVersionDraftError, feedback.errors.full_messages.join(", ")
    end

    # Notify the draft assignee (if any) about new feedback
    notify_assignee_of_feedback(template_version, feedback)

    feedback
  end

  # Resolves a feedback item.
  def self.resolve_feedback!(feedback, resolver:)
    feedback.resolve!(resolver)
    feedback
  end

  # Unresolves a previously resolved feedback item.
  def self.unresolve_feedback!(feedback)
    feedback.unresolve!
    feedback
  end

  # Returns a summary of feedback for a draft version.
  def self.feedback_summary(template_version)
    feedbacks = template_version.template_version_feedbacks

    {
      total: feedbacks.count,
      unresolved: feedbacks.unresolved.count,
      resolved: feedbacks.resolved.count,
      approvals: feedbacks.where(sentiment: :approve).count,
      change_requests: feedbacks.where(sentiment: :request_changes).count,
      comments: feedbacks.where(sentiment: :comment).count,
      has_blocking_feedback:
        feedbacks.unresolved.where(sentiment: :request_changes).exists?
    }
  end

  private

  def self.notify_assignee_of_feedback(template_version, feedback)
    assignee = template_version.assignee
    return if assignee.blank?
    return if assignee.id == feedback.user_id # Don't notify yourself

    notification_data = {
      "id" => SecureRandom.uuid,
      "action_type" => "draft_feedback_received",
      "action_text" =>
        "#{feedback.user.name} left #{feedback.sentiment} feedback on draft: #{template_version.label}",
      "object_data" => {
        "template_version_id" => template_version.id,
        "requirement_template_id" => template_version.requirement_template_id,
        "feedback_id" => feedback.id,
        "sentiment" => feedback.sentiment
      }
    }

    NotificationPushJob.perform_async({ assignee.id => notification_data })
  end

  private_class_method :notify_assignee_of_feedback
end
