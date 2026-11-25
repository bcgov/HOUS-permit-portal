import { Button, Modal, ModalContent, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { useMst } from "../../../../setup/root"
import { ECollaboratorType } from "../../../../types/enums"
import { CollaborationAssignmentModalContent } from "./collaboration-assignment-modal-content"
import { EAssignmentModalScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  requirementBlockId: string
}

const INITIAL_SCREEN = EAssignmentModalScreen.collaborationAssignment

export const CollaboratorAssignmentModal = observer(function AssignmentModal({
  permitApplication,
  requirementBlockId,
}: IProps) {
  const { userStore } = useMst()
  const currentUser = (userStore as any).currentUser
  const { t } = useTranslation()
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(requirementBlockId)
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<EAssignmentModalScreen>(INITIAL_SCREEN)
  const [openAssignmentConfirmationModals, setOpenAssignmentConfirmationModals] = React.useState<Set<string>>(new Set())
  const contentRef = React.useRef<HTMLDivElement>(null)

  const canManage = permitApplication.canUserManageCollaborators(currentUser)

  const changeScreen = (screen: EAssignmentModalScreen) => {
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
            showSearch={canManage}
          />
        </ModalContent>
      </Modal>
    </>
  )
})
