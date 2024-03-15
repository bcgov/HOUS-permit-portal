class RemindReviewerJob
  include Sidekiq::Worker

  def perform()
    Jurisdiction.all.each do |jur|
      unviewed_applications = jur.unviewed_permit_applications

      if unviewed_applications.any?
        jur.users.each { |user| PermitHubMailer.new.send_remind_reviewer_email(user, unviewed_applications) }
      end
    end
  end
end
