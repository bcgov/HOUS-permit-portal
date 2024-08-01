import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { Users } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useRef } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../../models/permit-application"
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
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
})

const DesignatedSubmitters = observer(function DesignatedSubmitters({ permitApplication, collaborationType }: IProps) {
  const { t } = useTranslation()
  const delegateeCollaboration = permitApplication.getCollaborationDelegatee(collaborationType)
  const isConfirmedUser =
    !delegateeCollaboration?.collaborator.user?.isDiscarded && !delegateeCollaboration?.collaborator.user?.isUnconfirmed
  const isEligibleForReInvite = delegateeCollaboration?.collaborator.user?.isSubmitter

  return (
    <Stack spacing={2}>
      <Text as={"h3"} fontSize={"md"} fontWeight={700}>
        {t("permitCollaboration.sidebar.designatedSubmitters")}
      </Text>
      <HStack
        px={4}
        py={3}
        w={"full"}
        border={"1px solid"}
        borderColor={"border.light"}
        borderRadius={"sm"}
        minH={"60px"}
        justifyContent={"space-between"}
      >
        <HStack spacing={4}>
          <Avatar name={delegateeCollaboration?.collaborator?.user?.name} size={"xs"} />
          {delegateeCollaboration ? (
            <Stack spacing={1}>
              <Text fontWeight={700}>{delegateeCollaboration.collaborator?.user?.name}</Text>
              <Text fontSize={"sm"}>{delegateeCollaboration.collaborator?.user?.organization}</Text>
              <Reinvite
                permitCollaboration={delegateeCollaboration}
                onReinvite={permitApplication.reinvitePermitCollaboration}
              />
            </Stack>
          ) : (
            <Text fontStyle={"italic"} color={"text.secondary"}>
              {t("permitCollaboration.sidebar.noDesignatedSubmitters")}
            </Text>
          )}
        </HStack>
        <DesignatedSubmitterAssignmentPopover
          permitApplication={permitApplication}
          collaborationType={collaborationType}
        />
      </HStack>
    </Stack>
  )
})
