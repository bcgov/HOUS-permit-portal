class ProjectGrantBlueprint < Blueprinter::Base
  identifier :id

  fields :kind,
         :project_membership_id,
         :permit_application_id,
         :requirement_block_id

  field :member_name do |grant|
    grant.project_membership.display_name
  end
end
