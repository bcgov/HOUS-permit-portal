class SubmissionVersion < ApplicationRecord
  belongs_to :permit_application
  has_many :revision_requests, dependent: :destroy

  accepts_nested_attributes_for :revision_requests, allow_destroy: true

  after_commit :notify_user_application_viewed

  def notify_user_application_viewed
    return if new_record?
    viewed_at_change = previous_changes.dig("viewed_at")
    # Check if the `viewed_at` was `nil` before the change and is now not `nil`.
    if (viewed_at_change&.first.nil? && viewed_at_change&.last.present?)
      NotificationService.publish_application_view_event(permit_application)
    end
  end
end
