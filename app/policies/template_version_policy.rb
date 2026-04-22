class TemplateVersionPolicy < ApplicationPolicy
  def index?
    # records are filtered by PolicyScope in this case
    true
  end

  def show?
    # Anonymous visitors (and any signed-in user) can view a draft template
    # version that has been explicitly marked as publicly previewable. This
    # powers the public /standardization-preview landing flow.
    return true if record&.draft? && record&.publicly_previewable?

    return false if user.nil?

    if sandbox.nil? || sandbox.published?
      # Non-public drafts are gated. Only super admins are exempt; everyone
      # else (including review managers) must hold an active (kept,
      # non-expired) TemplateVersionPreview invite for this record.
      if record&.draft?
        return true if user.super_admin?

        return active_previewer?
      end

      !record.scheduled? || user.super_admin?
    elsif sandbox.scheduled?
      record.scheduled?
    end
  end

  def show_jurisdiction_template_version_customization?
    record.sandbox == sandbox
  end

  def download_summary_csv?
    user.super_admin?
  end

  def download_customization_csv?
    download_summary_csv?
  end

  def download_customization_json?
    download_summary_csv?
  end

  def create_or_update_jurisdiction_template_version_customization?
    (user.review_manager? || user.regional_review_manager?) &&
      user.member_of?(record&.jurisdiction_id)
  end

  def show_integration_mapping?
    create_or_update_jurisdiction_template_version_customization?
  end

  def promote_jurisdiction_template_version_customization?
    create_or_update_jurisdiction_template_version_customization?
  end

  def compare_requirements?
    show?
  end

  def copy_jurisdiction_template_version_customization?
    show?
  end

  # Draft workflow mutations (share, invite previewers, refresh, update block)
  # should only be available to super admins and only on draft versions.
  def update?
    user&.super_admin? && record&.draft?
  end

  def active_previewer?
    return false if user.nil? || record.nil?

    record
      .template_version_previews
      .kept
      .where(previewer_id: user.id)
      .where("expires_at > ?", Time.current)
      .exists?
  end

  class Scope < Scope
    def resolve
      template_versions =
        scope
          .joins(:requirement_template)
          .where(requirement_templates: { discarded_at: nil })
          .where.not(status: "deprecated")

      return template_versions.for_sandbox(sandbox) if sandbox.present?
      return template_versions if user.super_admin?

      # Non-super-admins (including review managers) can only see drafts
      # they hold an active (kept, non-expired) TemplateVersionPreview
      # invite for.
      visible_draft_ids =
        TemplateVersionPreview
          .kept
          .where(previewer_id: user.id)
          .where("expires_at > ?", Time.current)
          .select(:template_version_id)

      visible_non_draft_statuses =
        if user.review_manager? || user.regional_review_manager?
          %w[scheduled published]
        else
          %w[published]
        end

      template_versions.where(status: visible_non_draft_statuses).or(
        template_versions.where(status: "draft", id: visible_draft_ids)
      )
    end
  end
end
