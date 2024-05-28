class TemplateVersionPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    !record.scheduled? || user.super_admin?
  end

  def show_jurisdiction_template_version_cutomization?
    true
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

  def create_or_update_jurisdiction_template_version_cutomization?
    (user.review_manager? || user.regional_review_manager?) && user.jurisdictions.find(record.jurisdiction_id)
  end

  def compare_requirements?
    show?
  end

  def compare_requirements?
    show?
  end

  class Scope < Scope
    def resolve
      [] unless user.super_admin?

      scope
        .joins(requirement_template: :activity)
        .where(requirement_templates: { discarded_at: nil })
        .where(status: "published")
    end
  end
end
