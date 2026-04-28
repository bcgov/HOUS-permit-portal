import { Button, Popover, PopoverContent, PopoverTrigger, Portal, Text, useDisclosure } from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { CollaborationAssignmentPopoverContent } from "./collaboration-assignment-popover-content"
import { CollaboratorInvite } from "./collaborator-invite-popover-content"
import { Reinvite } from "./reinvite"
import { EAssignmentPopoverScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

const INITIAL_SCREEN = EAssignmentPopoverScreen.collaborationAssignment

export const CollaboratorAssignmentPopover = observer(function AssignmentPopover({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { userStore } = useMst()
  const { currentUser } = userStore
  const { t } = useTranslation()
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<EAssignmentPopoverScreen>(INITIAL_SCREEN)
  const [openAssignmentConfirmationModals, setOpenAssignmentConfirmationModals] = React.useState<Set<string>>(new Set())
  const contentRef = React.useRef<HTMLDivElement>(null)

  const canManage = permitApplication.canUserManageCollaborators(currentUser, collaborationType)

  const changeScreen = (screen: EAssignmentPopoverScreen) => {
    // review does have the ability to invite new collaborators. They should already be present for a jurisdiction
    if (screen === EAssignmentPopoverScreen.collaboratorInvite && collaborationType === ECollaborationType.review) {
      return
    }

    setCurrentScreen(canManage ? screen : INITIAL_SCREEN)

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

  useEffect(() => {
    contentRef?.current?.focus()
  }, [currentScreen])

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

      contentRef.current?.focus()

      return newSet
    })
  }

  const createAssignmentConfirmationModalDisclosureProps = (collaboratorId: string) => ({
    isOpen: openAssignmentConfirmationModals.has(collaboratorId),
    onOpen: () => openAssignmentPopover(collaboratorId),
    onClose: () => closeAssignmentPopover(collaboratorId),
  })

  const onInviteCollaborator = (user: { email: string; firstName: string; lastName: string }) =>
    permitApplication.inviteNewCollaborator(ECollaboratorType.assignee, user, requirementBlockId)

  return (
    <Popover placement={"bottom-start"} isOpen={isOpen} onClose={onPopoverClose} onOpen={onOpen} isLazy>
      <PopoverTrigger>
        <Button
          onClick={(e) => {
            e.stopPropagation()
          }}
          onKeyDown={(e) => {
            e.stopPropagation()
          }}
          leftIcon={<Users />}
          variant={"link"}
        >
          <Text as={"span"} textDecoration={"underline"}>
            {t("permitCollaboration.popover.triggerButton", { count: existingAssignments.length })}
          </Text>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w={"370px"} maxW={"370px"} ref={contentRef}>
          {currentScreen === EAssignmentPopoverScreen.collaborationAssignment && (
            <CollaborationAssignmentPopoverContent
              onSelect={(collaboratorId) =>
                permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.assignee, requirementBlockId)
              }
              onClose={onClose}
              takenCollaboratorIds={existingCollaboratorIds}
              getConfirmationModalDisclosureProps={createAssignmentConfirmationModalDisclosureProps}
              transitionToInvite={
                canManage && collaborationType === ECollaborationType.submission
                  ? () => changeScreen(EAssignmentPopoverScreen.collaboratorInvite)
                  : undefined
              }
              selectedCollaborations={existingAssignments}
              selectedTitle={t("permitCollaboration.popover.collaborations.title")}
              selectedEmptyText={t("permitCollaboration.popover.assignment.noneAssigned")}
              onUnselectSelected={
                canManage
                  ? async (permitCollaboration) => {
                      try {
                        await permitApplication.unassignPermitCollaboration(permitCollaboration.id)
                      } finally {
                        contentRef.current?.focus()
                      }
                    }
                  : undefined
              }
              renderSelectedFooter={(permitCollaboration) => (
                <Reinvite
                  permitCollaboration={permitCollaboration as IPermitCollaboration}
                  onReinvite={permitApplication.reinvitePermitCollaboration}
                />
              )}
              showSearch={canManage}
              collaborationType={collaborationType}
            />
          )}
          {canManage &&
            currentScreen === EAssignmentPopoverScreen.collaboratorInvite &&
            collaborationType === ECollaborationType.submission && (
              <CollaboratorInvite
                onInviteSuccess={() => changeScreen(EAssignmentPopoverScreen.collaborationAssignment)}
                onClose={() => changeScreen(EAssignmentPopoverScreen.collaborationAssignment)}
                onInvite={onInviteCollaborator}
                confirmationModalDisclosureProps={createConfirmationModalDisclosureProps}
              />
            )}
        </PopoverContent>
      </Portal>
    </Popover>
  )
})
