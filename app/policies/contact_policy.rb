class ContactPolicy < ApplicationPolicy
  def contact_options?
    user.submitter? && user.id == record.contactable_id
  end

  def create?
    true
  end
end
