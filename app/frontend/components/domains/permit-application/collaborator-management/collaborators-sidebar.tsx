import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Link,
  Stack,
  StackProps,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Envelope, Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { ICollaborator } from "../../../../models/collaborator"
import { IPermitApplication } from "../../../../models/permit-application"
import { IPermitCollaboration } from "../../../../models/permit-collaboration"
import { useMst } from "../../../../setup/root"
import { ECollaborationType } from "../../../../types/enums"
import { DesignatedSubmitterAssignmentPopover } from "./designated-submitter-assignment-popover"
import { Reinvite } from "./reinvite"

interface IProps {
  permitApplication: IPermitApplication
  collaborationType: ECollaborationType
}

export const CollaboratorsSidebar = observer(function CollaboratorsSidebar({
  collaborationType,
  permitApplication,
}: IProps) {
  const { t } = useTranslation()
  const { userStore } = useMst()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const btnRef = useRef()

  return (
    <>
      <Button leftIcon={<Users />} variant={"primary"} onClick={onOpen}>
        {t("permitCollaboration.sidebar.triggerButton", {
          count: permitApplication.getCollaborationUniqueUserCount(collaborationType),
        })}
      </Button>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} finalFocusRef={btnRef}>
        <DrawerOverlay />
        <DrawerContent maxW={"430px"}>
          <DrawerCloseButton />
          <DrawerHeader gap={2} alignItems={"center"} display={"flex"} mt={7} px={8} pb={0}>
            <Users size={23} />
            <Text as="h2" fontWeight={700} fontSize={"2xl"}>
              {t("permitCollaboration.sidebar.title")}
            </Text>
          </DrawerHeader>

          <DrawerBody as={Stack} spacing={8}>
            <Text color={"text.secondary"} mt={6}>
              {t("permitCollaboration.sidebar.description")}
            </Text>
            <Stack borderLeft={"4px solid"} borderColor={"theme.blueAlt"} px={6} py={3} bg={"theme.blueLight"}>
              <Text fontSize={"lg"} fontWeight={700} color={"theme.blueAlt"}>
                {t("permitCollaboration.sidebar.howItWorksTitle")}
              </Text>
              {/*TODO update copy*/}
              <Text fontSize={"sm"}>{t("permitCollaboration.sidebar.howItWorksDescription")}</Text>
            </Stack>
            <DesignatedSubmitters permitApplication={permitApplication} collaborationType={collaborationType} />
            <Assignees permitApplication={permitApplication} collaborationType={collaborationType} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})

const DesignatedSubmitters = observer(function DesignatedSubmitters({ permitApplication, collaborationType }: IProps) {
  const { t } = useTranslation()
  const delegateeCollaboration = permitApplication.getCollaborationDelegatee(collaborationType)

  let name = delegateeCollaboration?.collaborator?.user?.name
  let organization = delegateeCollaboration?.collaborator?.user?.organization
  return (
    <Stack spacing={2}>
      <Text as={"h3"} fontSize={"md"} fontWeight={700}>
        {t("permitCollaboration.sidebar.designatedSubmitters")}
      </Text>
      <CollaborationCard
        rightElement={
          <DesignatedSubmitterAssignmentPopover
            permitApplication={permitApplication}
            collaborationType={collaborationType}
          />
        }
        onReinvite={permitApplication.reinvitePermitCollaboration}
        permitCollaboration={delegateeCollaboration}
      />
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
    </Stack>
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
      <HStack spacing={4}>
        <Avatar name={name} size={"xs"} />
        {permitCollaboration ? (
          <Stack spacing={1} alignItems={"flex-start"}>
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

const Assignees = observer(function Assignees({ permitApplication, collaborationType }: IProps) {
  const { t } = useTranslation()
  const sidebarAssigneeList = permitApplication.getSidebarAssigneesList(collaborationType)

  return (
    <Stack spacing={2}>
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
            />
          )
        })}
      </Stack>
    </Stack>
  )
})

const AssigneeAccordion = observer(function AssigneeAccordion({
  collaborator,
  permitCollaborations,
  permitApplication,
}: {
  permitApplication: IPermitApplication
  collaborator: ICollaborator
  permitCollaborations: IPermitCollaboration[]
}) {
  const { t } = useTranslation()
  const notificationEmail = collaborator?.user?.email

  return (
    <Accordion allowToggle>
      <AccordionItem border={"1px solid"} borderColor={"border.light"} borderRadius={"sm"}>
        {permitCollaborations?.[0] && (
          <Box as={"h4"} mb={0}>
            <AccordionButton
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
                rightElement={<AccordionIcon />}
                moreDetailsElement={
                  notificationEmail ? (
                    <HStack spacing={4} className={"collaboratorCardEmailContainer"} display={"none"}>
                      <Text as={"span"} fontSize={"sm"} fontWeight={700}>
                        {t("permitCollaboration.sidebar.assigneeEmail")}
                      </Text>
                      <Flex alignItems={"baseline"} color={"link"}>
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
            </AccordionButton>
          </Box>
        )}
        <AccordionPanel border={"none"} bg={"greys.grey04"}>
          <Box w={"full"} bg={"white"} p={2} border={"1px solid"} borderColor={"border.light"} borderRadius={"sm"}>
            <Text as={"h5"} fontSize={"sm"} fontWeight={700} textTransform={"uppercase"} color={"text.secondary"}>
              {t("permitCollaboration.sidebar.assignedTo")}
            </Text>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
})
