# Account role. Delegates to the role methods on User.
class AccountAccess
  delegate :submitter?,
           :reviewer?,
           :review_manager?,
           :regional_review_manager?,
           :super_admin?,
           :technical_support?,
           :review_staff?,
           :manager?,
           :jurisdiction_staff?,
           to: :@user,
           allow_nil: true

  def initialize(user)
    @user = user
  end
end
