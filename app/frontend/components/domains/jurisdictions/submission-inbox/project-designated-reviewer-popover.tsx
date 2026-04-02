import {
  Avatar,
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
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitProject } from "../../../../models/permit-project"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { RequestLoadingButton } from "../../../shared/request-loading-button"
import { SharedAvatar } from "../../../shared/user/shared-avatar"
import { CollaborationAssignmentPopoverContent } from "../../permit-application/collaborator-management/collaboration-assignment-popover-content"

interface IProps {
  project: IPermitProject
  renderTrigger?: (props: {
    isLoading: boolean
    reviewDelegatee: IPermitProject["reviewDelegatee"]
    onClick: (e: React.MouseEvent) => void
    isDisabled: boolean
  }) => React.ReactElement
  onBeforeOpen?: () => Promise<void>
}

export const ProjectDesignatedReviewerPopover = observer(function ProjectDesignatedReviewerPopover({
  project,
  renderTrigger,
  onBeforeOpen,
}: IProps) {
  const { userStore } = useMst()
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isBeforeOpenLoading, setIsBeforeOpenLoading] = useState(false)
  const [pendingCollaboratorId, setPendingCollaboratorId] = useState<string | null>(null)
  const confirmDisclosure = useDisclosure()
  const contentRef = React.useRef<HTMLDivElement>(null)

  const reviewDelegatee = project.reviewDelegatee
  const existingCollaboratorIds = new Set<string>(reviewDelegatee ? [reviewDelegatee.id] : [])

  useEffect(() => {
    if (isOpen) {
      setPendingCollaboratorId(null)
    }
  }, [isOpen])

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

  const onPopoverClose = () => {
    if (confirmDisclosure.isOpen) return
    onClose()
  }

  const handleSelectCollaborator = async (collaboratorId: string) => {
    setPendingCollaboratorId(collaboratorId)
    confirmDisclosure.onOpen()
  }

  const handleConfirmAssign = async (closeModal: () => void) => {
    if (!pendingCollaboratorId) return
    await project.assignReviewDelegatee(pendingCollaboratorId)
    setPendingCollaboratorId(null)
    closeModal()
    onClose()
  }

  const handleUnassign = async () => {
    await project.unassignReviewDelegatee()
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
      icon={
        reviewDelegatee?.user ? (
          <Avatar name={`${reviewDelegatee.user.firstName} ${reviewDelegatee.user.lastName}`} size="sm" />
        ) : (
          <UserPlus size={16} />
        )
      }
      aria-label={t("permitCollaboration.projectSidebar.projectReviewDelegatee")}
      onClick={triggerOnClick}
      isDisabled={isBeforeOpenLoading}
    />
  )

  return (
    <>
      <Popover placement="bottom-start" isOpen={isOpen} onClose={onPopoverClose} strategy="fixed" isLazy>
        <PopoverTrigger>
          {renderTrigger
            ? renderTrigger({
                isLoading: isBeforeOpenLoading,
                reviewDelegatee,
                onClick: triggerOnClick,
                isDisabled: isBeforeOpenLoading,
              })
            : renderDefaultTrigger()}
        </PopoverTrigger>
        <PopoverContent w="370px" maxW="370px" ref={contentRef}>
          <PopoverBody p={0}>
            <Stack
              borderLeft="4px solid"
              borderColor="theme.blueAlt"
              px={4}
              py={3}
              bg="theme.blueLight"
              mx={4}
              mt={4}
              borderRadius="sm"
            >
              <Text fontSize="xs">
                {/* @ts-ignore */}
                {t("permitCollaboration.projectSidebar.delegateeDescription")}
              </Text>
            </Stack>

            {reviewDelegatee?.user && (
              <Stack px={4} pt={3} spacing={1}>
                <Text fontSize="xs" fontWeight={700} color="text.secondary" textTransform="uppercase">
                  {/* @ts-ignore */}
                  {t("permitCollaboration.projectSidebar.projectReviewDelegatee")}
                </Text>
                <Stack
                  direction="row"
                  spacing={3}
                  p={2}
                  bg="gray.50"
                  borderRadius="md"
                  justify="space-between"
                  align="center"
                >
                  <Stack direction="row" spacing={2} align="center">
                    <SharedAvatar
                      size="xs"
                      name={`${reviewDelegatee.user.firstName} ${reviewDelegatee.user.lastName}`}
                      role={reviewDelegatee.user.role}
                    />
                    <Text fontSize="sm" fontWeight={600}>
                      {`${reviewDelegatee.user.firstName} ${reviewDelegatee.user.lastName}`}
                    </Text>
                  </Stack>
                  <RequestLoadingButton size="xs" variant="ghost" colorScheme="red" onClick={handleUnassign}>
                    {/* @ts-ignore */}
                    {t("permitCollaboration.projectSidebar.unassignDelegatee")}
                  </RequestLoadingButton>
                </Stack>
              </Stack>
            )}
          </PopoverBody>

          <CollaborationAssignmentPopoverContent
            onSelect={handleSelectCollaborator}
            onClose={onClose}
            takenCollaboratorIds={existingCollaboratorIds}
            collaborationType={ECollaborationType.review}
          />
        </PopoverContent>
      </Popover>

      <ConfirmationModal
        modalControlProps={confirmDisclosure}
        renderTriggerButton={() => <></>}
        // @ts-ignore
        title={t("permitCollaboration.projectSidebar.overrideConfirmTitle")}
        // @ts-ignore
        body={t("permitCollaboration.projectSidebar.overrideConfirmBody")}
        onConfirm={handleConfirmAssign}
        renderConfirmationButton={({ onClick }) => (
          <RequestLoadingButton variant="primary" onClick={onClick as () => Promise<any>}>
            {t("ui.confirm")}
          </RequestLoadingButton>
        )}
      />
    </>
  )
})
