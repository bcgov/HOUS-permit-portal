class RemindReviewerJob
  include Sidekiq::Worker

  def perform()
    Jurisdiction.all.each do |jur|
      unviewed_applications = jur.unviewed_permit_applications

      if unviewed_applications.any?
        jur.users.each { |user| PermitHubMailer.remind_reviewer(user, unviewed_applications).deliver }
      end
    end
  end
end
