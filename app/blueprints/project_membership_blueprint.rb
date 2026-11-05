class ProjectMembershipBlueprint < Blueprinter::Base
  identifier :id

  fields :user_id, :access, :contact_designation, :status

  field :name do |membership|
    membership.display_name
  end

  field :first_name do |membership|
    membership.user&.first_name || membership.invited_first_name
  end

  field :phone do |membership|
    membership.user&.phone_number
  end

  field :organization do |membership|
    membership.user&.organization
  end

  field :role_tags do |membership|
    membership.role_list.to_a
  end
end
