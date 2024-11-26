class PromoteUser
  attr_accessor :existing_user, :invited_user

  def initialize(existing_user:, invited_user:)
    @existing_user = existing_user
    @invited_user = invited_user
  end

  def call
    merge_users
    return self
  end

  private

  def merge_users
    accepted_params = %i[
      invitation_token
      invitation_created_at
      invitation_sent_at
      invitation_accepted_at
      invitation_limit
      invited_by_type
      invited_by_id
      invitations_count
    ]

    # only allow role to be upgraded, and not downgraded to submitter
    accepted_params << :role unless invited_user.submitter?

    invited_user_params = invited_user.slice(accepted_params)

    jurisdiction_ids =
      existing_user.jurisdiction_ids + invited_user.jurisdiction_ids
    existing_user.assign_attributes(invited_user_params)
    if existing_user.valid?
      ActiveRecord::Base.transaction do
        merge_collaborations
        invited_user.destroy!
        existing_user.jurisdiction_ids = jurisdiction_ids
        existing_user.save!
      end
    end
  end

  def merge_collaborations
    invited_user.collaborations.each do |invited_user_collaborator|
      existing_user_collaborator =
        existing_user.collaborations.find_by(
          collaboratorable: invited_user_collaborator.collaboratorable
        )

      # if the existing_user is not already a collaborator on the same record
      # then update the invited_user's collaborator record to use the existing_user
      unless existing_user_collaborator.present?
        invited_user_collaborator.update(user: existing_user)
        next
      end

      # if the existing_user is already a collaborator on the same record
      # then update the invited_users permit collaborations with this existing_user
      invited_user_collaborator
        .permit_collaborations
        .each do |invited_user_permit_collaboration|
        existing_user_permit_collaboration =
          existing_user_collaborator.permit_collaborations.find_by(
            permit_application:
              invited_user_permit_collaboration.permit_application,
            collaboration_type:
              invited_user_permit_collaboration.collaboration_type,
            collaborator_type:
              invited_user_permit_collaboration.collaborator_type,
            assigned_requirement_block_id:
              invited_user_permit_collaboration.assigned_requirement_block_id
          )

        # if the existing_user is already a collaborator on the same permit application record, collaboration type, and collaborator type and assigned requirement block
        # then skip this record as it is already being managed by the existing_user
        next if existing_user_permit_collaboration.present?

        invited_user_permit_collaboration.update(
          collaborator: existing_user_collaborator
        )
      end
    end

    invited_user.reload
  end
end
