class PermitProjectBlueprint < Blueprinter::Base
  identifier :id

  fields :title,
         :full_address,
         :forcasted_completion_date,
         :phase,
         :created_at,
         :updated_at

  field :jurisdiction_disambiguated_name do |permit_project, _options|
    permit_project.jurisdiction.disambiguated_name
  end

  # NOTE: is_pinned check is optimized by preloading ids in the controller
  field :is_pinned do |permit_project, options|
    options[:pinned_project_ids]&.include?(permit_project.id)
  end

  view :extended do
    association :permit_applications,
                blueprint: PermitApplicationBlueprint,
                view: :base
    association :project_documents, blueprint: ProjectDocumentBlueprint
  end
end
