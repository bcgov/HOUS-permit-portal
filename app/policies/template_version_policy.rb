class TemplateVersionPolicy < ApplicationPolicy
  def index?
    # records are filtered by PolicyScope in this case
    true
  end

  def show?
    if sandbox.nil? || sandbox.published?
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

  class Scope < Scope
    def resolve
      template_versions =
        scope
          .joins(requirement_template: :activity)
          .where(requirement_templates: { discarded_at: nil })
          .where.not(status: "deprecated")
      if sandbox.present?
        template_versions.for_sandbox(sandbox)
      elsif user.super_admin? || user.review_manager? ||
            user.regional_review_manager?
        template_versions
      else
        template_versions.where(status: "published")
      end
    end
  end
end
