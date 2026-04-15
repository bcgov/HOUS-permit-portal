import {
  AvatarGroup,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { UserPlus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { RequestLoadingButton } from "../../../shared/request-loading-button"
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
        <PopoverBody p={0}>
          {collaborations.length > 0 && (
            <Stack px={4} pt={4} spacing={2}>
              <Text fontSize="xs" fontWeight={700} color="text.secondary" textTransform="uppercase">
                {/* @ts-ignore */}
                {t("permitCollaboration.projectSidebar.projectReviewCollaborators")}
              </Text>
              {collaborations.map((c) => (
                <HStack key={c.id} spacing={3} p={2} bg="gray.50" borderRadius="md" justify="space-between">
                  <HStack spacing={2}>
                    <SharedAvatar size="xs" name={c.collaborator.user?.name} role={c.collaborator.user?.role} />
                    <Text fontSize="sm" fontWeight={600}>
                      {c.collaborator.user?.name}
                    </Text>
                  </HStack>
                  <RequestLoadingButton
                    size="xs"
                    variant="ghost"
                    colorScheme="red"
                    onClick={() => handleUnassign(c.collaborator.id)}
                  >
                    {/* @ts-ignore */}
                    {t("permitCollaboration.projectSidebar.unassignCollaborator")}
                  </RequestLoadingButton>
                </HStack>
              ))}
            </Stack>
          )}
        </PopoverBody>

        <CollaborationAssignmentPopoverContent
          onSelect={handleSelectCollaborator}
          onClose={onClose}
          takenCollaboratorIds={takenCollaboratorIds}
          collaborationType={ECollaborationType.review}
        />
      </PopoverContent>
    </Popover>
  )
})
