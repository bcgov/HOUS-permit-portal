import { AvatarGroup, Dialog, IconButton, Portal, useDisclosure } from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { CollaborationAssignmentModalContent } from "../../permit-application/collaborator-management/collaboration-assignment-modal-content"

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

export const ProjectReviewCollaboratorsModal = observer(function ProjectReviewCollaboratorsModal({
  project,
  renderTrigger,
  onBeforeOpen,
}: IProps) {
  const { userStore } = useMst()
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()
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
    onClose()
  }

  const handleUnassign = async (collaboratorId: string) => {
    await project.unassignProjectReviewCollaborator(collaboratorId)
    onClose()
  }

  const triggerOnClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    handleOpen()
  }

  const renderDefaultTrigger = () => (
    <IconButton
      variant="ghost"
      aria-label={t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
      onClick={triggerOnClick}
      disabled={isBeforeOpenLoading}
    >
      {collaborations.length > 0 ? (
        <AvatarGroup size="xs">
          {collaborations.map((c) => (
            <SharedAvatar key={c.id} size="xs" name={c.collaborator.user?.name} role={c.collaborator.user?.role} />
          ))}
        </AvatarGroup>
      ) : (
        <UserPlus size={16} />
      )}
    </IconButton>
  )

  return (
    <>
      {renderTrigger
        ? renderTrigger({
            isLoading: isBeforeOpenLoading,
            collaborationCount: collaborations.length,
            onClick: triggerOnClick,
            isDisabled: isBeforeOpenLoading,
          })
        : renderDefaultTrigger()}
      <Dialog.Root
        open={open}
        placement="center"
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              w={{ base: "calc(100vw - 2rem)", md: "370px" }}
              maxW="calc(100vw - 2rem)"
              maxH="min(560px, calc(100vh - 2rem))"
              overflow="hidden"
              display="flex"
              flexDirection="column"
            >
              <CollaborationAssignmentModalContent
                onSelect={handleSelectCollaborator}
                onClose={onClose}
                takenCollaboratorIds={takenCollaboratorIds}
                collaborationType={ECollaborationType.review}
                selectedCollaborations={collaborations}
                selectedTitle={t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
                onUnselectSelected={(collaboration) => handleUnassign(collaboration.collaborator.id)}
              />
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})
