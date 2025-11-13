class PreCheckExportService
  def initialize
  end

  def user_consent_csv
    CSV.generate(headers: true) do |csv|
      csv << [
        "Email",
        "Name",
        "Created Date",
        "Jurisdiction",
        "Submitted Date",
        "Completed Date",
        "EULA Accepted",
        "Consent to Send Drawings",
        "Consent to Share with Jurisdiction",
        "Consent to Research Contact"
      ]

      # Get the most recent 1000 pre-checks
      # Filter out users who opted out of research contact
      PreCheck
        .includes(:creator, :jurisdiction)
        .order(created_at: :desc)
        .limit(1000)
        .find_each do |pre_check|
          creator = pre_check.creator
          next unless creator

          csv << [
            creator.email,
            creator.name,
            pre_check.created_at&.strftime("%Y-%m-%d %H:%M:%S"),
            pre_check.jurisdiction&.qualified_name,
            pre_check.submitted_at&.strftime("%Y-%m-%d %H:%M:%S"),
            pre_check.completed_at&.strftime("%Y-%m-%d %H:%M:%S"),
            pre_check.eula_accepted,
            pre_check.consent_to_send_drawings,
            pre_check.consent_to_share_with_jurisdiction,
            pre_check.consent_to_research_contact
          ]
        end
    end
  end
end
