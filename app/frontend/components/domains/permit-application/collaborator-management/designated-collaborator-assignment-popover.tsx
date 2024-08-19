import { Avatar, Button, IconButton, Popover, PopoverContent, PopoverTrigger, useDisclosure } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { CollaborationAssignmentPopoverContent } from "./collaboration-assignment-popover-content"
import { CollaboratorInvite } from "./collaborator-invite-popover-content"
import { EAssignmentPopoverScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  avatarTrigger?: boolean
}

const INITIAL_SCREEN = EAssignmentPopoverScreen.collaborationAssignment

type TDesignatedSubmitterAssignmentPopoverScreen =
  | EAssignmentPopoverScreen.collaborationAssignment
  | EAssignmentPopoverScreen.collaboratorInvite

export const DesignatedCollaboratorAssignmentPopover = observer(function DesignatedSubmitterAssignmentPopover({
  permitApplication,
  collaborationType,
  avatarTrigger,
}: IProps) {
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { t } = useTranslation()
  const existingDelegateeCollaboration = permitApplication.getCollaborationDelegatee(collaborationType)
  const existingCollaboratorIds = new Set<string>(
    existingDelegateeCollaboration ? [existingDelegateeCollaboration.collaborator?.id] : []
  )
  const { isOpen, onOpen, onClose } = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<TDesignatedSubmitterAssignmentPopoverScreen>(INITIAL_SCREEN)
  const [openAssignmentConfirmationModals, setOpenAssignmentConfirmationModals] = React.useState<Set<string>>(new Set())
  const contentRef = React.useRef<HTMLDivElement>(null)

  const canManage = permitApplication.canUserManageCollaborators(currentUser, collaborationType)

  const changeScreen = (screen: TDesignatedSubmitterAssignmentPopoverScreen) => {
    if (!canManage || (!isSubmissionCollaboration && screen === EAssignmentPopoverScreen.collaboratorInvite)) {
      return
    }

    setCurrentScreen(screen)

    // This needs to be done as their is a focus loss issue when dynamically
    // changing the screen in the popover, causing close on blur to not work
    contentRef.current?.focus()
  }

  useEffect(() => {
    if (isOpen) {
      changeScreen(INITIAL_SCREEN)
      setOpenAssignmentConfirmationModals(new Set())
    }
  }, [isOpen])

  const onPopoverClose = () => {
    if (openAssignmentConfirmationModals.size > 0 || createConfirmationModalDisclosureProps.isOpen) {
      return
    }

    onClose()
  }

  const openAssignmentPopover = (collaboratorId: string) => {
    setOpenAssignmentConfirmationModals((prev) => new Set([...prev, collaboratorId]))
  }
  const closeAssignmentPopover = (collaboratorId: string) => {
    setOpenAssignmentConfirmationModals((prev) => {
      const newSet = new Set([...prev])
      newSet.delete(collaboratorId)
      return newSet
    })
  }

  const createAssignmentConfirmationModalDisclosureProps = (collaboratorId: string) => ({
    isOpen: openAssignmentConfirmationModals.has(collaboratorId),
    onOpen: () => openAssignmentPopover(collaboratorId),
    onClose: () => closeAssignmentPopover(collaboratorId),
  })

  const onInviteCollaborator = (user: { email: string; firstName: string; lastName: string }) =>
    permitApplication.inviteNewCollaborator(ECollaboratorType.delegatee, user)

  const isSubmissionCollaboration = collaborationType === ECollaborationType.submission

  const triggerButtonProps = {
    onClick: (e) => e.stopPropagation(),
    onKeyDown: (e) => e.stopPropagation(),
    isDisabled: !canManage,
  }
  return (
    <Popover
      placement={"bottom-start"}
      isOpen={isOpen}
      onClose={onPopoverClose}
      onOpen={onOpen}
      strategy={"fixed"}
      isLazy
    >
      <PopoverTrigger>
        {avatarTrigger ? (
          <IconButton
            variant={"ghost"}
            icon={
              existingDelegateeCollaboration ? (
                <Avatar name={existingDelegateeCollaboration?.collaborator?.user?.name} size={"sm"} />
              ) : (
                <Plus />
              )
            }
            aria-label={"designated assignee selector"}
          />
        ) : (
          <Button variant={"link"} textDecoration={"underline"} fontSize={"sm"} {...triggerButtonProps}>
            {existingDelegateeCollaboration
              ? t("permitCollaboration.popover.designatedSubmitterChangeButton")
              : t("ui.select")}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent w={"370px"} maxW={"370px"} ref={contentRef}>
        {canManage && currentScreen === EAssignmentPopoverScreen.collaborationAssignment && (
          <CollaborationAssignmentPopoverContent
            onSelect={async (collaboratorId) => {
              const response = await permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.delegatee)
              response && onClose()
            }}
            onClose={onClose}
            takenCollaboratorIds={existingCollaboratorIds}
            getConfirmationModalDisclosureProps={createAssignmentConfirmationModalDisclosureProps}
            transitionToInvite={
              isSubmissionCollaboration ? () => changeScreen(EAssignmentPopoverScreen.collaboratorInvite) : undefined
            }
            takenCollaboratorStrategy={"include"}
            onUnselect={async () => {
              if (!existingDelegateeCollaboration) return

              const response = await permitApplication.unassignPermitCollaboration(existingDelegateeCollaboration.id)
              response && onClose()
            }}
            collaborationType={collaborationType}
          />
        )}
        {canManage && currentScreen === EAssignmentPopoverScreen.collaboratorInvite && isSubmissionCollaboration && (
          <CollaboratorInvite
            onClose={() => changeScreen(INITIAL_SCREEN)}
            onInviteSuccess={onClose}
            onInvite={onInviteCollaborator}
            confirmationModalDisclosureProps={createConfirmationModalDisclosureProps}
          />
        )}
      </PopoverContent>
    </Popover>
  )
})
