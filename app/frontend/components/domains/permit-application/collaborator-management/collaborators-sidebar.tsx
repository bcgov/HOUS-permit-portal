import {
  Accordion,
  Avatar,
  Box,
  Button,
  ButtonProps,
  Drawer,
  Flex,
  HStack,
  IconButton,
  Link,
  Menu,
  Portal,
  Stack,
  StackProps,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { DotsThree, Envelope, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { ICollaborator } from "../../../../models/collaborator"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType, ECollaboratorType } from "../../../../types/enums"
import { getRequirementBlockAccordionNodes } from "../../../../utils/formio-helpers"
import { RemoveConfirmationModal } from "../../../shared/modals/remove-confirmation-modal"
import { RequestLoadingButton } from "../../../shared/request-loading-button"
import { DesignatedCollaboratorAssignmentModal } from "./designated-collaborator-assignment-modal"
import { Reinvite } from "./reinvite"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  triggerButtonProps?: Partial<ButtonProps>
}

interface IDrawerProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
  isOpen?: boolean
  open?: boolean
  onClose: () => void
}

export const CollaboratorsSidebarDrawer = observer(function CollaboratorsSidebarDrawer({
  permitApplication,
  collaborationType,
  isOpen,
  open,
  onClose,
}: IDrawerProps) {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const currentUser = userStore.currentUser
  const canManage = permitApplication.canUserManageCollaborators(currentUser, collaborationType)

  const drawerOpen = open ?? isOpen ?? false

  return (
    <Drawer.Root
      open={drawerOpen}
      placement="end"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content maxW={"430px"} pt={"var(--app-navbar-height)"}>
            <Drawer.CloseTrigger />
            <Drawer.Header gap={2} alignItems={"center"} display={"flex"} mt={7} px={8} pb={0}>
              <Users size={23} />
              <Text as="h2" fontWeight={700} fontSize={"2xl"}>
                {t("permitCollaboration.sidebar.title")}
              </Text>
            </Drawer.Header>
            <Drawer.Body gap={8} asChild>
              <Stack>
                <Text color={"text.secondary"} mt={6}>
                  {t(`permitCollaboration.sidebar.description.${collaborationType}`)}
                </Text>
                <Stack borderLeft={"4px solid"} borderColor={"theme.blueAlt"} px={6} py={3} bg={"theme.blueLight"}>
                  <Text fontSize={"lg"} fontWeight={700} color={"theme.blueAlt"}>
                    {t("permitCollaboration.sidebar.howItWorksTitle")}
                  </Text>
                  {/*TODO update copy*/}
                  <Text fontSize={"sm"}>
                    {
                      <Trans
                        i18nKey={`permitCollaboration.sidebar.howItWorksDescription.${collaborationType}`}
                        t={t}
                        components={{
                          1: <br />,
                        }}
                      />
                    }
                  </Text>
                </Stack>
                <DesignatedCollaborators
                  permitApplication={permitApplication}
                  collaborationType={collaborationType}
                  canManage={canManage}
                />
                <Assignees
                  permitApplication={permitApplication}
                  collaborationType={collaborationType}
                  canManage={canManage}
                />
              </Stack>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  )
})

export const CollaboratorsSidebar = observer(function CollaboratorsSidebar({
  collaborationType,
  permitApplication,
  triggerButtonProps,
}: IProps) {
  const { t } = useTranslation()
  const { open, onOpen, onClose } = useDisclosure()

  return (
    <>
      <Button variant={"primary"} onClick={onOpen} {...triggerButtonProps}>
        <Users />
        {t("permitCollaboration.sidebar.triggerButton", {
          count: permitApplication.getCollaborationUniqueUserCount(collaborationType),
        })}
      </Button>
      <CollaboratorsSidebarDrawer
        permitApplication={permitApplication}
        collaborationType={collaborationType}
        open={open}
        onClose={onClose}
      />
    </>
  )
})

const DesignatedCollaborators = observer(function DesignatedCollaborators({
  permitApplication,
  collaborationType,
  canManage,
}: IProps & {
  canManage: boolean
}) {
  const { t } = useTranslation()
  const delegateeCollaboration = permitApplication.getCollaborationDelegatee(collaborationType)

  let name = delegateeCollaboration?.collaborator?.user?.name
  let organization = delegateeCollaboration?.collaborator?.user?.organization
  const isSubmissionCollaboration = collaborationType === ECollaborationType.submission
  if (collaborationType === ECollaborationType.review && !permitApplication.isDesignatedReviewerEnabled) {
    return <></>
  }
  return (
    <Stack gap={2}>
      <Text as={"h3"} fontSize={"md"} fontWeight={700}>
        {t(`permitCollaboration.sidebar.designated${isSubmissionCollaboration ? "Submitters" : "Reviewers"}`)}
      </Text>
      <CollaborationCard
        rightElement={
          canManage ? (
            <DesignatedCollaboratorAssignmentModal
              permitApplication={permitApplication}
              collaborationType={collaborationType}
            />
          ) : undefined
        }
        onReinvite={canManage ? permitApplication.reinvitePermitCollaboration : undefined}
        permitCollaboration={delegateeCollaboration}
      />
      {isSubmissionCollaboration && (
        <Text fontSize={"sm"} color={"text.secondary"}>
          <Trans
            t={t}
            i18nKey={
              organization
                ? "permitCollaboration.sidebar.authorCanSubmitWithOrganization"
                : "permitCollaboration.sidebar.authorCanSubmit"
            }
            components={{
              1: <Text as={"span"} fontWeight={700} />,
            }}
            values={{
              author: name,
              organization: organization,
            }}
          />
        </Text>
      )}
    </Stack>
  )
})

const Assignees = observer(function Assignees({
  permitApplication,
  collaborationType,
  canManage,
}: IProps & { canManage: boolean }) {
  const { t } = useTranslation()
  const sidebarAssigneeList = permitApplication.getSidebarAssigneesList(collaborationType)

  return (
    <Stack gap={2}>
      <Text as={"h3"} fontSize={"md"} fontWeight={700}>
        {t("permitCollaboration.sidebar.assignees")}
      </Text>
      <Text fontSize={"sm"} color={"text.secondary"}>
        {t("permitCollaboration.sidebar.assigneeHelperText")}
      </Text>
      <Stack>
        {sidebarAssigneeList.map(({ collaborator, permitCollaborations }) => {
          return (
            <AssigneeAccordion
              key={collaborator?.id}
              permitApplication={permitApplication}
              collaborator={collaborator}
              permitCollaborations={permitCollaborations}
              collaborationType={collaborationType}
              canManage={canManage}
            />
          )
        })}
      </Stack>
    </Stack>
  )
})

const AssigneeAccordion = observer(function AssigneeAccordion({
  collaborator,
  collaborationType,
  permitCollaborations,
  permitApplication,
  canManage,
}: {
  permitApplication: IPermitApplication
  collaborator: ICollaborator
  permitCollaborations: IPermitCollaboration[]
  collaborationType: ECollaborationType
  canManage: boolean
}) {
  const { t } = useTranslation()

  const notificationEmail = collaborator?.user?.email
  const formioRequirementBlockAccordionNodes = getRequirementBlockAccordionNodes()
  // This might happen if the an assignment happens in a previous version and the requirement block has been removed.
  // We want to filter them out as they are not relevant to the current permit application and the user cannot navigate to them.
  const filteredPermitCollaborations = permitCollaborations.filter((permitCollaboration) => {
    return permitCollaboration?.assignedRequirementBlockName
  })

  return (
    <Accordion.Root collapsible>
      <Accordion.Item border={"1px solid"} borderColor={"border.light"} borderRadius={"sm"} value="item-0">
        {permitCollaborations?.[0] && (
          <Box as={"h4"} mb={0}>
            <Accordion.ItemTrigger
              p={0}
              border={"none"}
              _expanded={{
                bg: "greys.grey04",
                ".collaboratorCardEmailContainer": {
                  display: "flex",
                },
              }}
            >
              <CollaborationCard
                border={"none"}
                rightElement={<Accordion.ItemIndicator />}
                moreDetailsElement={
                  notificationEmail ? (
                    <HStack gap={4} className={"collaboratorCardEmailContainer"} display={"none"}>
                      <Text fontSize={"sm"} fontWeight={700}>
                        {t("permitCollaboration.sidebar.assigneeEmail")}
                      </Text>
                      <Flex alignItems={"baseline"} color={"link"} onClick={(e) => e.stopPropagation()} flexGrow={1}>
                        <Envelope
                          size={14}
                          style={{
                            flexShrink: 0,
                            color: "var(--chakra-colors-text-link)",
                          }}
                        />
                        <Link
                          ml={1}
                          href={`mailto:${notificationEmail}`}
                          fontSize={"sm"}
                          color={"text.link"}
                          wordBreak={"break-word"}
                          overflowWrap={"break-word"}
                          whiteSpace={"pre-wrap"}
                          display={"inline-block"}
                        >
                          {notificationEmail}
                        </Link>
                      </Flex>
                    </HStack>
                  ) : undefined
                }
                permitCollaboration={permitCollaborations?.[0]}
              />
            </Accordion.ItemTrigger>
          </Box>
        )}
        <Accordion.ItemContent border={"none"} bg={"greys.grey04"} pb={2}>
          <Accordion.ItemBody>
            <Box
              w={"full"}
              bg={"white"}
              p={2}
              border={"1px solid red"}
              borderColor={"border.light"}
              borderRadius={"sm"}
            >
              <Text as={"h5"} fontSize={"sm"} fontWeight={700} textTransform={"uppercase"} color={"text.secondary"}>
                {t("permitCollaboration.sidebar.assignedTo")}
              </Text>
              <Box as={"ul"} listStyleType={"none"} p={0} mt={3}>
                {filteredPermitCollaborations.map((permitCollaboration) => {
                  const requirementBlockNode =
                    formioRequirementBlockAccordionNodes[permitCollaboration.assignedRequirementBlockId]
                  const onNavigate = () => {
                    requirementBlockNode?.scrollIntoView({ behavior: "smooth", block: "center" })
                  }
                  return (
                    <HStack as={"li"} key={permitCollaboration.id} justifyContent={"space-between"}>
                      <Button
                        variant={"link"}
                        onClick={onNavigate}
                        size={"sm"}
                        fontSize={"sm"}
                        maxW={"full"}
                        disabled={!requirementBlockNode}
                      >
                        <Text overflow={"hidden"} textOverflow={"ellipsis"} whiteSpace={"nowrap"} maxW={"full"}>
                          {permitCollaboration.assignedRequirementBlockName}
                        </Text>
                      </Button>
                      {canManage && (
                        <Menu.Root closeOnSelect={false}>
                          <Menu.Trigger asChild>
                            <IconButton
                              icon={<DotsThree size={14} />}
                              color={"text.primary"}
                              size={"xs"}
                              aria-label={"unassign requirement block menu"}
                              variant={"ghost"}
                            ></IconButton>
                          </Menu.Trigger>
                          <Portal>
                            <Menu.Positioner>
                              <Menu.Content>
                                <Menu.Item
                                  fontSize={"sm"}
                                  border={"1px solid"}
                                  borderColor={"borders.medium"}
                                  borderRadius={"sm !important"}
                                  value="item-0"
                                  asChild
                                >
                                  <RequestLoadingButton
                                    onSelect={() =>
                                      permitApplication.unassignPermitCollaboration(permitCollaboration.id)
                                    }
                                  >
                                    {t("permitCollaboration.popover.collaborations.unassignButton")}
                                  </RequestLoadingButton>
                                </Menu.Item>
                              </Menu.Content>
                            </Menu.Positioner>
                          </Portal>
                        </Menu.Root>
                      )}
                    </HStack>
                  )
                })}
              </Box>
            </Box>
            <RemoveConfirmationModal
              onRemove={() =>
                permitApplication.removeCollaboratorCollaborations(
                  collaborator.id,
                  ECollaboratorType.assignee,
                  collaborationType
                )
              }
              triggerButtonProps={{
                mt: 2,
                display: canManage ? "block" : "none",
              }}
              title={t("permitCollaboration.sidebar.removeCollaboratorModal.title")}
              body={t("permitCollaboration.sidebar.removeCollaboratorModal.body")}
              triggerText={t("permitCollaboration.sidebar.removeCollaboratorModal.triggerButton")}
              renderConfirmationButton={({ onClick }) => (
                <RequestLoadingButton onClick={onClick as () => Promise<any>} variant={"primary"}>
                  {t("ui.remove")}
                </RequestLoadingButton>
              )}
            />
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Accordion.Root>
  )
})

const CollaborationCard = observer(function CollaborationCard({
  permitCollaboration,
  onReinvite,
  rightElement,
  moreDetailsElement,
  ...containerProps
}: {
  permitCollaboration?: IPermitCollaboration
  onReinvite?: (collaborationId: string) => Promise<any>
  rightElement?: React.ReactNode
  moreDetailsElement?: React.ReactNode
} & Partial<StackProps>) {
  const { t } = useTranslation()
  const name = permitCollaboration?.collaborator?.user?.name
  const organization = permitCollaboration?.collaborator?.user?.organization

  return (
    <HStack
      px={4}
      py={3}
      w={"full"}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"sm"}
      minH={"60px"}
      justifyContent={"space-between"}
      {...containerProps}
    >
      <HStack gap={4} w={"full"}>
        <Avatar.Root size={"xs"} maxW={"24px"}>
          <Avatar.Fallback name={name} />
        </Avatar.Root>
        {permitCollaboration ? (
          <Stack gap={1} alignItems={"flex-start"}>
            <Text fontWeight={700}>{name}</Text>
            <Text fontSize={"sm"}>{organization}</Text>
            {onReinvite && <Reinvite permitCollaboration={permitCollaboration} onReinvite={onReinvite} />}
            {moreDetailsElement}
          </Stack>
        ) : (
          <Text fontStyle={"italic"} color={"text.secondary"}>
            {t("permitCollaboration.sidebar.noDesignatedSubmitters")}
          </Text>
        )}
      </HStack>
      {rightElement}
    </HStack>
  )
})
