class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :title,
           :full_address,
           :pid,
           :project_number,
           :jurisdiction_disambiguated_name,
           :rollup_status,
           :is_pinned,
           :created_at,
           :updated_at

    field :total_permits_count, default: 0
    field :new_draft_count, default: 0
    field :newly_submitted_count, default: 0
    field :revisions_requested_count, default: 0
    field :resubmitted_count, default: 0
    field :approved_count, default: 0

    field :jurisdiction_disambiguated_name do |permit_project, _options|
      permit_project.jurisdiction.disambiguated_name
    end

    # NOTE: is_pinned check is optimized by preloading ids in the controller
    field :is_pinned do |permit_project, options|
      options[:pinned_project_ids]&.include?(permit_project.id)
    end

    field :has_outdated_draft_applications do |permit_project, options|
      options[:project_ids_with_outdated_drafts]&.include?(permit_project.id)
    end
  end

  view :extended do
    include_view :base

    field :is_fully_loaded do |pa, options|
      true
    end

    association :recent_permit_applications,
                name: :recentPermitApplications,
                blueprint: PermitApplicationBlueprint,
                view: :base do |permit_project, _options|
      permit_project.recent_permit_applications
    end
    association :project_documents, blueprint: ProjectDocumentBlueprint
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
  end
end
