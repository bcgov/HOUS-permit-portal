class CollaboratorPolicy < ApplicationPolicy
  def collaborator_search?
    if record.collaboratorable_type == "User"
      record.collaboratorable == user
    elsif record.collaboratorable_type == "Jurisdiction"
      user.jurisdictions.find(record.collaboratorable.id).present?
    else
      false
    end
  end
end
