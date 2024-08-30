import {
  Avatar,
  Box,
  Button,
  HStack,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { RequestLoadingButton } from "../../../shared/request-loading-button"
import { CollaborationAssignmentPopoverContent } from "./collaboration-assignment-popover-content"
import { CollaboratorInvite } from "./collaborator-invite-popover-content"
import { Reinvite } from "./reinvite"
import { EAssignmentPopoverScreen } from "./types"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

const INITIAL_SCREEN = EAssignmentPopoverScreen.collaborations

export const CollaboratorAssignmentPopover = observer(function AssignmentPopover({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { userStore, collaboratorStore } = useMst()
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
          {currentScreen === EAssignmentPopoverScreen.collaborations && (
            <Collaborations
              permitCollaborations={existingAssignments}
              transitionToAssign={
                canManage ? () => changeScreen(EAssignmentPopoverScreen.collaborationAssignment) : undefined
              }
              onUnassign={
                canManage
                  ? async (permitCollaborationId) => {
                      try {
                        await permitApplication.unassignPermitCollaboration(permitCollaborationId)
                      } finally {
                        contentRef.current?.focus()
                      }
                    }
                  : undefined
              }
              onReinvite={permitApplication.reinvitePermitCollaboration}
            />
          )}
          {canManage && currentScreen === EAssignmentPopoverScreen.collaborationAssignment && (
            <CollaborationAssignmentPopoverContent
              onSelect={(collaboratorId) =>
                permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.assignee, requirementBlockId)
              }
              onClose={() => changeScreen(EAssignmentPopoverScreen.collaborations)}
              takenCollaboratorIds={existingCollaboratorIds}
              getConfirmationModalDisclosureProps={createAssignmentConfirmationModalDisclosureProps}
              transitionToInvite={
                canManage && collaborationType === ECollaborationType.submission
                  ? () => changeScreen(EAssignmentPopoverScreen.collaboratorInvite)
                  : undefined
              }
              collaborationType={collaborationType}
            />
          )}
          {canManage &&
            currentScreen === EAssignmentPopoverScreen.collaboratorInvite &&
            collaborationType === ECollaborationType.submission && (
              <CollaboratorInvite
                onInviteSuccess={() => changeScreen(EAssignmentPopoverScreen.collaborations)}
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

const Collaborations = observer(function PermitCollaborations({
  transitionToAssign,
  permitCollaborations,
  onUnassign,
  onReinvite,
}: {
  transitionToAssign?: () => void
  onUnassign?: (permitCollaborationId: string) => Promise<void>
  onReinvite?: (permitCollaborationId: string) => Promise<void>
  permitCollaborations: IPermitCollaboration[]
}) {
  const { t } = useTranslation()

  return (
    <>
      <PopoverHeader
        fontSize={"lg"}
        fontFamily={"heading"}
        fontWeight={"bold"}
        p={4}
        display="flex"
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        {t("permitCollaboration.popover.collaborations.title")}
        {transitionToAssign && (
          <Button leftIcon={<Plus />} onClick={transitionToAssign} variant={"primary"} size={"sm"} fontSize={"sm"}>
            {t("permitCollaboration.popover.collaborations.assignButton")}
          </Button>
        )}
      </PopoverHeader>
      <PopoverBody px={5} py={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0} spacing={4}>
          {permitCollaborations.length === 0 && (
            <Text textAlign={"center"} fontSize={"sm"} color={"text.secondary"} fontStyle={"italic"}>
              {t("permitCollaboration.popover.assignment.noneAssigned")}
            </Text>
          )}
          {permitCollaborations.map((permitCollaboration) => {
            const name = permitCollaboration.collaborator.user.name
            const organization = permitCollaboration.collaborator.user.organization
            const isConfirmedUser =
              !permitCollaboration.collaborator.user?.isDiscarded &&
              !permitCollaboration.collaborator.user?.isUnconfirmed
            const isEligibleForReinvite = permitCollaboration.collaborator.user?.isSubmitter
            return (
              <Stack
                key={permitCollaboration.id}
                px={4}
                py={"0.625rem"}
                border={"1px solid"}
                borderColor={"border.light"}
                borderRadius={"sm"}
                bg={!isEligibleForReinvite && !isConfirmedUser ? "greys.grey03" : undefined}
              >
                <HStack spacing={2}>
                  <Avatar name={name} size={"sm"} />
                  <Box flex={1} h={"full"} ml={2}>
                    <Text fontWeight={700}>{name}</Text>
                    {organization && <Text fontSize={"sm"}>{organization}</Text>}
                  </Box>

                  {onUnassign && (
                    <RequestLoadingButton
                      onClick={() => onUnassign(permitCollaboration.id)}
                      size={"sm"}
                      fontSize={"sm"}
                      variant={"link"}
                    >
                      {t("permitCollaboration.popover.collaborations.unassignButton")}
                    </RequestLoadingButton>
                  )}
                </HStack>
                <Reinvite permitCollaboration={permitCollaboration} onReinvite={onReinvite} />
              </Stack>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})
