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

  def notify_new_integration_mapping_external
    integration_mapping =
      IntegrationMapping.joins(:template_version).where(template_versions: { status: "scheduled" }).first

    return unless integration_mapping.present?

    external_api_key = ExternalApiKey.active.where(jurisdiction: integration_mapping.jurisdiction).first

    return unless external_api_key.present?

    PermitHubMailer.notify_integration_mapping_external(
      external_api_key:,
      template_version: integration_mapping.template_version,
    )
  end

  def notify_missing_integration_mapping_external
    integration_mapping =
      IntegrationMapping.joins(:template_version).where(template_versions: { status: "published" }).first

    return unless integration_mapping.present?

    external_api_key = ExternalApiKey.active.where(jurisdiction: integration_mapping.jurisdiction).first

    return unless external_api_key.present?

    PermitHubMailer.notify_integration_mapping_external(
      external_api_key:,
      template_version: integration_mapping.template_version,
    )
  end
end
