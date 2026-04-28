import { AvatarGroup, IconButton, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { CollaborationAssignmentPopoverContent } from "../../permit-application/collaborator-management/collaboration-assignment-popover-content"

interface IProps {
  project: IPermitProject
  renderTrigger?: (props: {
    isLoading: boolean
    collaborationCount: number
    onClick: (e: React.MouseEvent) => void
    isDisabled: boolean
  }) => React.ReactElement
  onBeforeOpen?: () => Promise<void>
}

export const ProjectReviewCollaboratorsPopover = observer(function ProjectReviewCollaboratorsPopover({
  project,
  renderTrigger,
  onBeforeOpen,
}: IProps) {
  const { userStore } = useMst()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isBeforeOpenLoading, setIsBeforeOpenLoading] = useState(false)

  const collaborations = project.permitProjectCollaborations
  const takenCollaboratorIds = new Set<string>(collaborations.map((c) => c.collaborator.id))

  const handleOpen = async () => {
    if (onBeforeOpen) {
      setIsBeforeOpenLoading(true)
      try {
        await onBeforeOpen()
      } finally {
        setIsBeforeOpenLoading(false)
      }
    }
    onOpen()
  }

  const handleSelectCollaborator = async (collaboratorId: string) => {
    await project.assignProjectReviewCollaborator(collaboratorId)
  }

  const handleUnassign = async (collaboratorId: string) => {
    await project.unassignProjectReviewCollaborator(collaboratorId)
  }

  const triggerOnClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handleOpen()
  }

  const renderDefaultTrigger = () => (
    <IconButton
      variant="ghost"
      icon={
        collaborations.length > 0 ? (
          <AvatarGroup size="xs" max={3}>
            {collaborations.map((c) => (
              <SharedAvatar key={c.id} size="xs" name={c.collaborator.user?.name} role={c.collaborator.user?.role} />
            ))}
          </AvatarGroup>
        ) : (
          <UserPlus size={16} />
        )
      }
      aria-label={t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
      onClick={triggerOnClick}
      isDisabled={isBeforeOpenLoading}
    />
  )

  return (
    <Popover placement="bottom-start" isOpen={isOpen} onClose={onClose} strategy="fixed" isLazy>
      <PopoverTrigger>
        {renderTrigger
          ? renderTrigger({
              isLoading: isBeforeOpenLoading,
              collaborationCount: collaborations.length,
              onClick: triggerOnClick,
              isDisabled: isBeforeOpenLoading,
            })
          : renderDefaultTrigger()}
      </PopoverTrigger>
      <PopoverContent w="370px" maxW="370px">
        <CollaborationAssignmentPopoverContent
          onSelect={handleSelectCollaborator}
          onClose={onClose}
          takenCollaboratorIds={takenCollaboratorIds}
          collaborationType={ECollaborationType.review}
          selectedCollaborations={collaborations}
          selectedTitle={t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
          onUnselectSelected={(collaboration) => handleUnassign(collaboration.collaborator.id)}
        />
      </PopoverContent>
    </Popover>
  )
})
