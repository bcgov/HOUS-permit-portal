import { Avatar, Button, Dialog, IconButton, Portal, useDisclosure } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { CollaborationAssignmentModalContent } from "./collaboration-assignment-modal-content"
import { CollaboratorInviteModalContent } from "./collaborator-invite-modal-content"
import { EAssignmentModalScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  avatarTrigger?: boolean
  additionalCollaborations?: IPermitCollaboration[]
  renderTrigger?: (props: {
    isLoading: boolean
    existingDelegateeCollaboration: IPermitCollaboration | undefined
    onClick: (e: React.MouseEvent) => void
    isDisabled: boolean
  }) => React.ReactElement
  onBeforeOpen?: () => Promise<void>
}

const INITIAL_SCREEN = EAssignmentModalScreen.collaborationAssignment

type TDesignatedSubmitterAssignmentModalScreen =
  | EAssignmentModalScreen.collaborationAssignment
  | EAssignmentModalScreen.collaboratorInvite

export const DesignatedCollaboratorAssignmentModal = observer(function DesignatedSubmitterAssignmentModal({
  permitApplication,
  collaborationType,
  avatarTrigger,
  additionalCollaborations = [],
  renderTrigger,
  onBeforeOpen,
}: IProps) {
  const { userStore } = useMst()
  const currentUser = (userStore as any).currentUser
  const { t } = useTranslation()
  const existingDelegateeCollaboration =
    collaborationType === ECollaborationType.submission
      ? permitApplication.designatedSubmitter
      : permitApplication.designatedReviewer
  const existingCollaboratorIds = new Set<string>(
    existingDelegateeCollaboration ? [existingDelegateeCollaboration.collaborator?.id] : []
  )
  const { open, onOpen, onClose } = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [isBeforeOpenLoading, setIsBeforeOpenLoading] = useState(false)
  const [currentScreen, setCurrentScreen] = React.useState<TDesignatedSubmitterAssignmentModalScreen>(INITIAL_SCREEN)
  const [openAssignmentConfirmationModals, setOpenAssignmentConfirmationModals] = React.useState<Set<string>>(new Set())
  const contentRef = React.useRef<HTMLDivElement>(null)

  const canManage = permitApplication.canUserManageCollaborators(currentUser, collaborationType)

  const changeScreen = (screen: TDesignatedSubmitterAssignmentModalScreen) => {
    if (!canManage || (!isSubmissionCollaboration && screen === EAssignmentModalScreen.collaboratorInvite)) {
      return
    }

    setCurrentScreen(screen)

    // This needs to be done as there is a focus loss issue when dynamically
    // changing the screen in the modal.
    contentRef.current?.focus()
  }

  useEffect(() => {
    if (open) {
      changeScreen(INITIAL_SCREEN)
      setOpenAssignmentConfirmationModals(new Set())
    }
  }, [open])

  const onModalClose = () => {
    if (openAssignmentConfirmationModals.size > 0 || createConfirmationModalDisclosureProps.open) {
      return
    }

    onClose()
  }

  const openAssignmentConfirmationModal = (collaboratorId: string) => {
    setOpenAssignmentConfirmationModals((prev) => new Set([...prev, collaboratorId]))
  }
  const closeAssignmentConfirmationModal = (collaboratorId: string) => {
    setOpenAssignmentConfirmationModals((prev) => {
      const newSet = new Set([...prev])
      newSet.delete(collaboratorId)
      return newSet
    })
  }

  const createAssignmentConfirmationModalDisclosureProps = (collaboratorId: string) => ({
    isOpen: openAssignmentConfirmationModals.has(collaboratorId),
    onOpen: () => openAssignmentConfirmationModal(collaboratorId),
    onClose: () => closeAssignmentConfirmationModal(collaboratorId),
  })

  const onInviteCollaborator = (user: { email: string; firstName: string; lastName: string }) =>
    permitApplication.inviteNewCollaborator(ECollaboratorType.delegatee, user)

  const isSubmissionCollaboration = collaborationType === ECollaborationType.submission
  const selectedTitle = isSubmissionCollaboration
    ? t("permitCollaboration.sidebar.designatedSubmitters")
    : t("permitCollaboration.sidebar.designatedReviewers")

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

  const triggerButtonProps = {
    onClick: (e) => {
      e.stopPropagation()
      e.preventDefault()
      handleOpen()
    },
    onKeyDown: (e) => e.stopPropagation(),
    isDisabled: !canManage || isBeforeOpenLoading,
  }

  const renderDefaultTrigger = () =>
    avatarTrigger ? (
      <IconButton variant={"ghost"} aria-label={"designated assignee selector"} {...triggerButtonProps}>
        {existingDelegateeCollaboration ? (
          <Avatar.Root size={"sm"}>
            <Avatar.Fallback name={existingDelegateeCollaboration?.collaborator?.user?.name} />
          </Avatar.Root>
        ) : (
          <Plus />
        )}
      </IconButton>
    ) : (
      <Button variant={"link"} textDecoration={"underline"} fontSize={"sm"} {...triggerButtonProps}>
        {existingDelegateeCollaboration
          ? t("permitCollaboration.popover.designatedSubmitterChangeButton")
          : t("ui.select")}
      </Button>
    )

  return (
    <>
      {renderTrigger
        ? renderTrigger({
            isLoading: isBeforeOpenLoading,
            existingDelegateeCollaboration,
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation()
              e.preventDefault()
              handleOpen()
            },
            isDisabled: !canManage || isBeforeOpenLoading,
          })
        : renderDefaultTrigger()}
      <Dialog.Root
        open={open}
        placement="center"
        onOpenChange={(e) => {
          if (!e.open) {
            onModalClose()
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
              ref={contentRef}
            >
              {canManage && currentScreen === EAssignmentModalScreen.collaborationAssignment && (
                <CollaborationAssignmentModalContent
                  onSelect={async (collaboratorId) => {
                    const response = await permitApplication.assignCollaborator(
                      collaboratorId,
                      ECollaboratorType.delegatee
                    )
                    response && onClose()
                  }}
                  onClose={onClose}
                  takenCollaboratorIds={existingCollaboratorIds}
                  getConfirmationModalDisclosureProps={createAssignmentConfirmationModalDisclosureProps}
                  transitionToInvite={
                    isSubmissionCollaboration
                      ? () => changeScreen(EAssignmentModalScreen.collaboratorInvite)
                      : undefined
                  }
                  selectedCollaborations={existingDelegateeCollaboration ? [existingDelegateeCollaboration] : []}
                  selectedTitle={selectedTitle}
                  selectedEmptyText={t("permitCollaboration.popover.assignment.noneAssigned")}
                  onUnselectSelected={async () => {
                    if (!existingDelegateeCollaboration) return

                    const response = await permitApplication.unassignPermitCollaboration(
                      existingDelegateeCollaboration.id
                    )
                    response && onClose()
                  }}
                  additionalCollaborations={additionalCollaborations}
                  collaborationType={collaborationType}
                />
              )}
              {canManage &&
                currentScreen === EAssignmentModalScreen.collaboratorInvite &&
                isSubmissionCollaboration && (
                  <CollaboratorInviteModalContent
                    onClose={() => changeScreen(INITIAL_SCREEN)}
                    onInviteSuccess={onClose}
                    onInvite={onInviteCollaborator}
                    confirmationModalDisclosureProps={createConfirmationModalDisclosureProps}
                  />
                )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})
