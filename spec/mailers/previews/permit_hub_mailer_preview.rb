class PermitHubMailerPreview < ActionMailer::Preview
  def notify_new_integration_mapping
    integration_mapping =
      IntegrationMapping.joins(:template_version).where(template_versions: { status: "scheduled" }).first

    return unless integration_mapping.present?

    user = integration_mapping.jurisdiction.users.kept.find_by(role: "review_manager")

    return unless user.present?

    PermitHubMailer.notify_integration_mapping(user:, integration_mapping:)
  end

  def notify_missing_integration_mapping
    integration_mapping =
      IntegrationMapping.joins(:template_version).where(template_versions: { status: "published" }).first

    return unless integration_mapping.present?

    user = integration_mapping.jurisdiction.users.kept.find_by(role: "regional_review_manager")

    return unless user.present?

    PermitHubMailer.notify_integration_mapping(user:, integration_mapping:)
  end
end
