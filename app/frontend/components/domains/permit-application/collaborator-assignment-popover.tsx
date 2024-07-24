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
  SimpleGrid,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Plus, Users, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ISearch } from "../../../lib/create-search-model"
import { IPermitApplication } from "../../../models/permit-application"
import { IPermitCollaboration } from "../../../models/permit-collaboration"
import { useMst } from "../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../types/enums"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { ConfirmationModal } from "../../shared/confirmation-modal"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { TextFormControl } from "../../shared/form/input-form-control"
import { RequestLoadingButton } from "../../shared/request-loading-button"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  requirementBlockId: string
}

enum EScreen {
  collaborations,
  collaborationAssignment,
  collaboratorInvite,
}

const INITIAL_SCREEN = EScreen.collaborations
export const CollaboratorAssignmentPopover = observer(function AssignmentPopover({
  permitApplication,
  collaborationType,
  requirementBlockId,
}: IProps) {
  const { t } = useTranslation()
  const existingAssignments = permitApplication.getCollaborationAssigneesByBlockId(
    collaborationType,
    requirementBlockId
  )
  const existingCollaboratorIds = new Set<string>(existingAssignments.map((a) => a.collaborator.id))
  const { isOpen, onOpen, onClose } = useDisclosure()
  const assignConfirmationModalDisclosureProps = useDisclosure()
  const createConfirmationModalDisclosureProps = useDisclosure()
  const [currentScreen, setCurrentScreen] = React.useState<EScreen>(INITIAL_SCREEN)
  const contentRef = React.useRef<HTMLDivElement>(null)

  const changeScreen = (screen: EScreen) => {
    setCurrentScreen(screen)

    // This needs to be done as their is a focus loss issue when dynamically
    // changing the screen in the popover, causing close on blur to not work
    contentRef.current?.focus()
  }

  useEffect(() => {
    if (isOpen) {
      changeScreen(INITIAL_SCREEN)
    }
  }, [isOpen])

  const onPopoverClose = () => {
    if (assignConfirmationModalDisclosureProps.isOpen || createConfirmationModalDisclosureProps.isOpen) {
      return
    }

    onClose()
  }

  const onInviteCollaborator = (user: { email: string; firstName: string; lastName: string }) =>
    permitApplication.inviteNewCollaborator(ECollaboratorType.assignee, user, requirementBlockId)

  return (
    <Popover placement={"bottom-start"} isOpen={isOpen} onClose={onPopoverClose} onOpen={onOpen}>
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
          {currentScreen === EScreen.collaborations && (
            <Collaborations
              permitCollaborations={existingAssignments}
              transitionToAssign={() => changeScreen(EScreen.collaborationAssignment)}
              onUnassign={(permitCollaborationId) =>
                permitApplication.unassignPermitCollaboration(permitCollaborationId)
              }
            />
          )}
          {currentScreen === EScreen.collaborationAssignment && (
            <CollaborationAssignment
              onSelect={(collaboratorId) =>
                permitApplication.assignCollaborator(collaboratorId, ECollaboratorType.assignee, requirementBlockId)
              }
              onClose={() => changeScreen(EScreen.collaborations)}
              takenCollaboratorIds={existingCollaboratorIds}
              confirmationModalDisclosureProps={assignConfirmationModalDisclosureProps}
              transitionToInvite={() => changeScreen(EScreen.collaboratorInvite)}
            />
          )}
          {currentScreen === EScreen.collaboratorInvite && (
            <CollaboratorInvite
              transitionToScreen={changeScreen}
              onInvite={onInviteCollaborator}
              confirmationModalDisclosureProps={createConfirmationModalDisclosureProps}
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
  confirmationModalDisclosureProps,
  transitionToInvite,
}: {
  onSelect?: (collaboratorId?: string) => Promise<void>
  takenCollaboratorIds?: Set<string>
  onClose?: () => void
  confirmationModalDisclosureProps?: ReturnType<typeof useDisclosure>
  transitionToInvite?: () => void
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
        <HStack justifyContent={"space-between"}>
          <ModelSearchInput
            searchModel={collaboratorStore as ISearch}
            inputProps={{ w: "194px", placeholder: "Find" }}
          />
          <Button variant={"secondary"} leftIcon={<Plus />} size={"sm"} fontSize={"sm"} onClick={transitionToInvite}>
            {t("permitCollaboration.popover.assignment.newContactButton")}
          </Button>
        </HStack>
      </PopoverHeader>
      <PopoverBody p={4}>
        <Stack as={"ul"} w={"full"} listStyleType={"none"} pl={0}>
          {collaboratorSearchList.length === 0 && (
            <Text textAlign={"center"} fontSize={"sm"} color={"text.secondary"} fontStyle={"italic"}>
              {t("permitCollaboration.popover.assignment.noResultsText")}
            </Text>
          )}
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
                borderRadius={"sm"}
                _hover={{
                  bg: "theme.blueLight",
                }}
              >
                {collaborator.user?.name}
                <ConfirmationModal
                  title={t("permitCollaboration.popover.assignment.inviteWarning.title")}
                  body={t("permitCollaboration.popover.assignment.inviteWarning.body")}
                  triggerText={t("ui.proceed")}
                  renderTriggerButton={({ onClick, ...rest }) => (
                    <Button
                      variant={"ghost"}
                      color={"text.link"}
                      size={"sm"}
                      fontWeight={"semibold"}
                      fontSize={"sm"}
                      onClick={onClick}
                      {...rest}
                    >
                      {t("ui.select")}
                    </Button>
                  )}
                  onConfirm={(onClose) => {
                    onSelect?.(collaborator.id)
                    onClose()
                  }}
                  modalControlProps={confirmationModalDisclosureProps}
                  modalContentProps={{
                    maxW: "700px",
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
  onUnassign?: (permitCollaborationId: string) => Promise<void>
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
        <Button leftIcon={<Plus />} onClick={transitionToAssign} variant={"primary"} size={"sm"} fontSize={"sm"}>
          {t("permitCollaboration.popover.collaborations.assignButton")}
        </Button>
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
                <Avatar name={name} size={"sm"} />
                <Box flex={1} h={"full"} ml={2}>
                  <Text fontWeight={700}>{name}</Text>
                  {organization && <Text fontSize={"sm"}>{organization}</Text>}
                </Box>
                <RequestLoadingButton
                  onClick={() => onUnassign?.(permitCollaboration.id)}
                  size={"sm"}
                  fontSize={"sm"}
                  variant={"link"}
                >
                  {t("permitCollaboration.popover.collaborations.unassignButton")}
                </RequestLoadingButton>
              </HStack>
            )
          })}
        </Stack>
      </PopoverBody>
    </>
  )
})

interface ICollaboratorInviteForm {
  email: string
  firstName: string
  lastName: string
}

const CollaboratorInvite = observer(function CollaboratorCreate({
  onInvite,
  confirmationModalDisclosureProps,
  transitionToScreen,
}: {
  onInvite?: (user: { email: string; firstName: string; lastName: string }) => Promise<IPermitCollaboration>
  confirmationModalDisclosureProps?: ReturnType<typeof useDisclosure>
  transitionToScreen?: (screen: EScreen) => void
}) {
  const { t } = useTranslation()
  const formMethods = useForm<ICollaboratorInviteForm>({
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
    },
  })
  const {
    formState: { isValid, isSubmitting },
    handleSubmit,
  } = formMethods

  const onSubmit = handleSubmit(async (values) => {
    const response = await onInvite?.(values)
    response && transitionToScreen?.(EScreen.collaborations)
  })

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
        {t("permitCollaboration.popover.collaboratorInvite.title")}
        <IconButton
          size={"xs"}
          onClick={() => transitionToScreen(EScreen.collaborationAssignment)}
          variant={"ghost"}
          aria-label={"close assignment screen"}
          icon={<X />}
          color={"text.primary"}
        />
      </PopoverHeader>
      <PopoverBody px={5} py={4}>
        <FormProvider {...formMethods}>
          <SimpleGrid columns={2} spacing={4}>
            <TextFormControl label={t("contact.fields.firstName")} fieldName={`firstName`} required />
            <TextFormControl label={t("contact.fields.lastName")} fieldName={`lastName`} required />
            <Box gridColumn={"span 2"}>
              <EmailFormControl
                inputProps={{
                  type: "email",
                }}
                label={t("contact.fields.email")}
                fieldName={`email`}
                validate
                required
              />
            </Box>
            <Box gridColumn={"span 2"}>
              <ConfirmationModal
                title={t("permitCollaboration.popover.assignment.inviteWarning.title")}
                body={t("permitCollaboration.popover.assignment.inviteWarning.body")}
                triggerText={t("ui.proceed")}
                renderTriggerButton={({ onClick, ...rest }) => (
                  <Button
                    variant={"primary"}
                    size={"sm"}
                    fontWeight={"semibold"}
                    fontSize={"sm"}
                    onClick={onClick as (e: React.MouseEvent) => Promise<any>}
                    isDisabled={!isValid}
                    isLoading={isSubmitting}
                    {...rest}
                  >
                    {t("permitCollaboration.popover.collaboratorInvite.inviteButton")}
                  </Button>
                )}
                onConfirm={(_onClose) => {
                  onSubmit()
                }}
                modalControlProps={confirmationModalDisclosureProps}
                modalContentProps={{
                  maxW: "700px",
                }}
                confirmButtonProps={{
                  isLoading: isSubmitting,
                  isDisabled: !isValid,
                }}
              />
            </Box>
          </SimpleGrid>
        </FormProvider>
      </PopoverBody>
    </>
  )
})
