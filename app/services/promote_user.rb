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
    invited_user_params =
      invited_user.slice(
        %i[
          role
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
    jurisdiction_ids = existing_user.jurisdiction_ids + invited_user.jurisdiction_ids
    existing_user.assign_attributes(invited_user_params.merge({ jurisdiction_ids: }))
    if existing_user.valid?
      ActiveRecord::Base.transaction do
        invited_user.destroy!
        existing_user.save!
      end
    end
  end
end
