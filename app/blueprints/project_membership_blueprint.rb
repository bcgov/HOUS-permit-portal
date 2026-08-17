class ProjectMembershipBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :role, :permit_project_id, :created_at

    association :user, blueprint: UserBlueprint, view: :minimal

    field :team_kinds do |project_membership, _options|
      project_membership.teams.map(&:kind)
    end

    field :is_invitation_pending do |project_membership, _options|
      project_membership.user.confirmed_at.blank?
    end

    field :invited_by_name do |project_membership, _options|
      project_membership.invited_by&.name
    end
  end
end
