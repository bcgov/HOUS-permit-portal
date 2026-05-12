class RemindReviewerJob
  include Sidekiq::Worker

  def perform()
    Jurisdiction.all.each do |jur|
      unviewed_applications = jur.unviewed_permit_applications

      if unviewed_applications.any?
        jur.submission_contacts.confirmed.each do |contact|
          PermitHubMailer.remind_reviewer(
            contact,
            unviewed_applications
          ).deliver
        end
      end
    end
  end
end
