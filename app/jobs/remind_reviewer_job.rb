class RemindReviewerJob
  include Sidekiq::Worker

  def perform()
    Jurisdiction.all.each do |jur|
      unviewed_applications = jur.unviewed_permit_applications

      if unviewed_applications.any?
        jur.permit_type_submission_contacts.each do |contact|
          apps = unviewed_applications.where(permit_type: contact.permit_type)
          PermitHubMailer.remind_reviewer(contact, apps).deliver if apps.any?
        end
      end
    end
  end
end
