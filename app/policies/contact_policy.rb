class ContactPolicy < ApplicationPolicy
  def create?
    true
  end

  def update?
    user.id == record.contactable_id
  end

  def contact_options?
    update?
  end

  def destroy?
    update?
  end
end
