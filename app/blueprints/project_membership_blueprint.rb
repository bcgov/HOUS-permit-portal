class ProjectMembershipBlueprint < Blueprinter::Base
  identifier :id

  view :base do
    fields :role, :permit_project_id, :created_at, :invited_email

    association :user,
                blueprint: UserBlueprint,
                view: :minimal,
                if: ->(_field_name, project_membership, _options) do
                  project_membership.accepted?
                end

    # Pending invitations are on no team until accepted, so they report none.
    # Custom teams are named, so the kind alone is not enough to label them.
    field :teams do |project_membership, _options|
      next [] unless project_membership.accepted?

      project_membership.teams.map do |team|
        { id: team.id, name: team.name, kind: team.kind }
      end
    end

    field :is_invitation_pending do |project_membership, _options|
      project_membership.pending?
    end

    field :invited_by_name do |project_membership, _options|
      project_membership.invited_by&.name
    end
  end

  view :invitation do
    fields :role, :invited_email

    field :expired do |project_membership, _options|
      project_membership.invitation_expired?
    end

    field :project_id do |project_membership, _options|
      project_membership.permit_project_id
    end

    field :project_title do |project_membership, _options|
      project_membership.permit_project.title
    end

    field :inviter_name do |project_membership, _options|
      project_membership.invited_by&.name
    end
  end
end
