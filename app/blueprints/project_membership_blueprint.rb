class ProjectMembershipBlueprint < Blueprinter::Base
  identifier :id

  fields :user_id, :access, :contact_designation, :status

  field :name do |membership|
    membership.display_name
  end

  field :first_name do |membership|
    membership.user&.first_name || membership.invited_first_name
  end

  field :organization do |membership|
    membership.user&.organization
  end

  field :role_tags do |membership|
    membership.role_list.to_a
  end

  field :can_edit_role_tags do |membership, options|
    options[:project_access]&.edit_role_tags?(membership) || false
  end
end
