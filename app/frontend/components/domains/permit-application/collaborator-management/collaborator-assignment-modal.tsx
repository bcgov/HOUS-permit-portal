import { Button, Modal, ModalContent, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { CollaborationAssignmentModalContent } from "./collaboration-assignment-modal-content"
import { CollaboratorInviteModalContent } from "./collaborator-invite-modal-content"
import { Reinvite } from "./reinvite"
import { EAssignmentModalScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

const INITIAL_SCREEN = EAssignmentModalScreen.collaborationAssignment

export const CollaboratorAssignmentModal = observer(function AssignmentModal({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { userStore } = useMst()
  const currentUser = (userStore as any).currentUser
  const { t } = useTranslation()
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<EAssignmentModalScreen>(INITIAL_SCREEN)
  const [openAssignmentConfirmationModals, setOpenAssignmentConfirmationModals] = React.useState<Set<string>>(new Set())
  const contentRef = React.useRef<HTMLDivElement>(null)

  const canManage = permitApplication.canUserManageCollaborators(currentUser, collaborationType)

  const changeScreen = (screen: EAssignmentModalScreen) => {
    // review does have the ability to invite new collaborators. They should already be present for a jurisdiction
    if (screen === EAssignmentModalScreen.collaboratorInvite && collaborationType === ECollaborationType.review) {
      return
    }

    setCurrentScreen(canManage ? screen : INITIAL_SCREEN)

    // This needs to be done as there is a focus loss issue when dynamically
    // changing the screen in the modal.
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

  const onModalClose = () => {
    if (openAssignmentConfirmationModals.size > 0 || createConfirmationModalDisclosureProps.isOpen) {
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

      contentRef.current?.focus()

      return newSet
    })
  }

  const createAssignmentConfirmationModalDisclosureProps = (collaboratorId: string) => ({
    isOpen: openAssignmentConfirmationModals.has(collaboratorId),
    onOpen: () => openAssignmentConfirmationModal(collaboratorId),
    onClose: () => closeAssignmentConfirmationModal(collaboratorId),
  })

  const onInviteCollaborator = (user: { email: string; firstName: string; lastName: string }) =>
    permitApplication.inviteNewCollaborator(ECollaboratorType.assignee, user, requirementBlockId)

  return (
    <>
      <Button
        onClick={(e) => {
          e.stopPropagation()
          onOpen()
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
      <Modal isOpen={isOpen} onClose={onModalClose} isCentered>
        <ModalOverlay />
        <ModalContent
          w={{ base: "calc(100vw - 2rem)", md: "370px" }}
          maxW="calc(100vw - 2rem)"
          maxH="min(560px, calc(100vh - 2rem))"
          overflow="hidden"
          display="flex"
          flexDirection="column"
          ref={contentRef}
        >
          {currentScreen === EAssignmentModalScreen.collaborationAssignment && (
            <CollaborationAssignmentModalContent
              onSelect={async (collaboratorId) => {
                const response = await permitApplication.assignCollaborator(
                  collaboratorId,
                  ECollaboratorType.assignee,
                  requirementBlockId
                )
                response && onClose()
              }}
              onClose={onClose}
              takenCollaboratorIds={existingCollaboratorIds}
              getConfirmationModalDisclosureProps={createAssignmentConfirmationModalDisclosureProps}
              transitionToInvite={
                canManage && collaborationType === ECollaborationType.submission
                  ? () => changeScreen(EAssignmentModalScreen.collaboratorInvite)
                  : undefined
              }
              selectedCollaborations={existingAssignments}
              selectedTitle={t("permitCollaboration.popover.collaborations.title")}
              selectedEmptyText={t("permitCollaboration.popover.assignment.noneAssigned")}
              onUnselectSelected={
                canManage
                  ? async (permitCollaboration) => {
                      if (!permitCollaboration.id) return

                      try {
                        const response = await permitApplication.unassignPermitCollaboration(permitCollaboration.id)
                        response && onClose()
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
            currentScreen === EAssignmentModalScreen.collaboratorInvite &&
            collaborationType === ECollaborationType.submission && (
              <CollaboratorInviteModalContent
                onInviteSuccess={() => changeScreen(EAssignmentModalScreen.collaborationAssignment)}
                onClose={() => changeScreen(EAssignmentModalScreen.collaborationAssignment)}
                onInvite={onInviteCollaborator}
                confirmationModalDisclosureProps={createConfirmationModalDisclosureProps}
              />
            )}
        </ModalContent>
      </Modal>
    </>
  )
})
