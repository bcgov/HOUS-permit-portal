import {
  Avatar,
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Portal,
  Stack,
  Text,
  useDisclosure,
  usePopoverContext,
} from "@chakra-ui/react"
import { Plus, Users, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IPermitApplication } from "../../../models/permit-application"
import { IPermitCollaboration } from "../../../models/permit-collaboration"
import { useMst } from "../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { ConfirmationModal } from "../../shared/confirmation-modal"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

enum EScreens {
  collaborations,
  collaborationAssignment,
  collaboratorCreate,
}

export const CollaboratorAssignmentPopover = observer(function AssignmentPopover({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { collaboratorStore } = useMst()
  const { collaboratorSearchList } = collaboratorStore
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<EScreens>(EScreens.collaborations)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const changeScreen = (screen: EScreens) => {
    setCurrentScreen(screen)

    // This needs to be done as their is a focus loss issue when dynamically
    // changing the screen in the popover, causing close on blur to not work
    contentRef.current?.focus()
  }

  useEffect(() => {
    if (isOpen) {
      changeScreen(EScreens.collaborations)
    }
  }, [isOpen])

  return (
    <Popover placement={"bottom-start"} isOpen={isOpen} onClose={onClose} onOpen={onOpen}>
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
            Assign ({existingAssignments.length})
          </Text>
        </Button>
      </PopoverTrigger>
      <Portal>
        <PopoverContent w={"370px"} maxW={"370px"} ref={contentRef}>
          {currentScreen === EScreens.collaborations && (
            <Collaborations
              permitCollaborations={existingAssignments}
              transitionToAssign={() => changeScreen(EScreens.collaborationAssignment)}
            />
          )}
          {currentScreen === EScreens.collaborationAssignment && (
            <CollaborationAssignment
              onSelect={(collaboratorId) =>
                permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.assignee, requirementBlockId)
              }
              onClose={() => changeScreen(EScreens.collaborations)}
              takenCollaboratorIds={existingCollaboratorIds}
            />
          )}
        </PopoverContent>
      </Portal>
    </Popover>
  )
})

const CollaborationAssignment = observer(function CollaboratorSearch({
  onSelect,
  takenCollaboratorIds = new Set<string>(),
  onClose,
}: {
  onSelect?: (collaboratorId?: string) => void | Promise<void>
  takenCollaboratorIds?: Set<string>
  onClose?: () => void
}) {
  const { collaboratorStore } = useMst()
  const collaboratorSearchList = collaboratorStore.getFilteredCollaborationSearchList(takenCollaboratorIds)
  const { t } = useTranslation()

  useEffect(() => {
    collaboratorStore.search()
    return () => collaboratorStore.setQuery(null)
  }, [])

  return (
    <>
      <PopoverHeader as={Stack} p={4}>
        <Flex justifyContent={"space-between"}>
          <Text fontSize={"lg"} fontFamily={"heading"} fontWeight={"bold"}>
            {t("permitCollaboration.popover.assignment.title")}
          </Text>
          <IconButton
            size={"xs"}
            onClick={onClose}
            variant={"ghost"}
            aria-label={"close assignment screen"}
            icon={<X />}
            color={"text.primary"}
          />
        </Flex>
        <ModelSearchInput searchModel={collaboratorStore as ISearch} inputProps={{ placeholder: "Find" }} />
      </PopoverHeader>
      <PopoverBody p={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0}>
          {collaboratorSearchList.map((collaborator) => {
            return (
              <Text
                key={collaborator.id}
                as={"li"}
                px={2}
                py={"0.375rem"}
                fontSize={"sm"}
                fontWeight={"bold"}
                color={"text.link"}
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
              >
                {collaborator.user?.name}
                <ConfirmationModal
                  title={t("permitCollaboration.popover.assignment.inviteWarning.title")}
                  body={t("permitCollaboration.popover.assignment.inviteWarning.body")}
                  triggerText={t("ui.proceed")}
                  renderTriggerButton={(props) => (
                    <Button
                      variant={"ghost"}
                      color={"text.link"}
                      size={"sm"}
                      fontWeight={"semibold"}
                      fontSize={"sm"}
                      {...props}
                    >
                      {t("ui.select")}{" "}
                    </Button>
                  )}
                  onConfirm={(onClose) => {
                    onSelect?.(collaborator.id)
                    onClose()
                  }}
                />
              </Text>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})

const Collaborations = observer(function PermitCollaborations({
  transitionToAssign,
  onUnassign,
  permitCollaborations,
}: {
  transitionToAssign?: () => void
  onUnassign?: (permitCollaborationId: string) => void | Promise<void>
  permitCollaborations: IPermitCollaboration[]
}) {
  const { collaboratorStore } = useMst()
  const { t } = useTranslation()
  const { isOpen } = usePopoverContext()

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
        <Button leftIcon={<Plus />} onClick={transitionToAssign} variant={"primary"} size={"sm"} fontSize={"sm"}>
          {t("permitCollaboration.popover.collaborations.assignButton")}
        </Button>
      </PopoverHeader>
      <PopoverBody px={5} py={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0} spacing={4}>
          {permitCollaborations.map((permitCollaboration) => {
            const name = permitCollaboration.collaborator.user.name
            const organization = permitCollaboration.collaborator.user.organization
            return (
              <HStack
                key={permitCollaboration.id}
                spacing={2}
                px={4}
                py={"0.625rem"}
                border={"1px solid"}
                borderColor={"border.light"}
                borderRadius={"sm"}
              >
                <Avatar
                  name={name}
                  bg={name ? "semantic.warningLight" : "greys.grey02"}
                  color={"text.primary"}
                  size={"sm"}
                />
                <Box flex={1} h={"full"} ml={2}>
                  <Text fontWeight={700}>{name}</Text>
                  {organization && <Text fontSize={"sm"}>{organization}</Text>}
                </Box>
              </HStack>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})
