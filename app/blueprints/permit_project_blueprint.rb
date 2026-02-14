class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :title,
           :full_address,
           :pid,
           :number,
           :jurisdiction_disambiguated_name,
           :rollup_status,
           :is_pinned,
           :created_at,
           :updated_at,
           :owner_id,
           :latitude,
           :longitude,
           :parcel_geometry

    field :total_permits_count, default: 0
    field :new_draft_count, default: 0
    field :newly_submitted_count, default: 0
    field :revisions_requested_count, default: 0
    field :resubmitted_count, default: 0
    field :approved_count, default: 0
    field :owner_name, default: nil

    field :is_fully_loaded do |_permit_project, _options|
      false
    end

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

    field :is_fully_loaded do |_permit_project, _options|
      true
    end

    association :recent_permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :project_base do |permit_project, options|
      permit_project.recent_permit_applications(options[:current_user])
    end
    association :project_documents,
                blueprint: ProjectDocumentBlueprint do |permit_project, options|
      permit_project.project_documents(options[:current_user])
    end
    association :jurisdiction, blueprint: JurisdictionBlueprint, view: :base
  end
end
