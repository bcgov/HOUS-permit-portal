class CollaboratorPolicy < ApplicationPolicy
  def collaborator_search?
    if record.collaboratorable_type == "User"
      record.collaboratorable_id == user.id
    elsif record.collaboratorable_type == "Jurisdiction"
      user.jurisdictions.find(record.collaboratorable_id).present?
    else
      false
    end
  end
end
