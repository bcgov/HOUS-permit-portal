import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EUserRoles } from "../../types/enums"

export function UserRolesExplanationModal() {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const rolesToExplain = [EUserRoles.submitter, EUserRoles.reviewManager, EUserRoles.reviewer]
  return (
    <>
      <Button onClick={onOpen} variant={"link"} textDecoration={"underline"}>
        {t("user.rolesAndPermissions")}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent maxW={"container.md"}>
          <ModalHeader>{t("user.rolesAndPermissions")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack as={"ul"} listStyleType={"none"} spacing={4} pl={0} pb={4}>
              {rolesToExplain.map((role) => (
                <Text as={"li"} key={role}>
                  <Text as={"span"} fontWeight={700} textTransform={"capitalize"}>
                    {t(`user.roles.${role}`)}:
                  </Text>{" "}
                  {t(`user.rolesExplanation.${role}`)}
                </Text>
              ))}
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
