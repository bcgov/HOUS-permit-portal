class MergeSubmitterWithInvitedUser
  attr_accessor :submitter, :invited_user

  def initialize(submitter:, invited_user:)
    @submitter = submitter
    @invited_user = invited_user
  end

  def call
    merge_users
    return self
  end

  private

  def merge_users
    invited_user_params =
      invited_user.slice(
        %i[
          role
          jurisdiction_id
          invitation_token
          invitation_created_at
          invitation_sent_at
          invitation_accepted_at
          invitation_limit
          invited_by_type
          invited_by_id
          invitations_count
        ],
      )
    submitter.update!(invited_user_params)
    invited_user.destroy!
  end
end
