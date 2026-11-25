class CollaboratorPolicy < ApplicationPolicy
  def collaborator_search?
    user.member_of?(record.jurisdiction_id)
  end
end
