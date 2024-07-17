class PermitApplication::CollaborationManagementService
  attr_accessor :permit_application

  def initialize(permit_application)
    @permit_application = permit_application
  end

  def build_permit_collaboration(collaborator_id:, collaborator_type:, assigned_requirement_block_id: nil)
    collaborator = Collaborator.find(collaborator_id)

    permit_application.permit_collaborations.build(
      collaborator: collaborator,
      collaborator_type: collaborator_type,
      assigned_requirement_block_id: assigned_requirement_block_id,
    )
  end
end
