import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { BlockSetup } from "./block-setup"

export const RequirementsBlockModal = observer(function RequirementsBlockModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  return (
    <>
      <Button variant={"primary"} onClick={onOpen}>
        {t("requirementsLibrary.modals.create.triggerButton")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent as={"form"} w={"min(1170px, calc(95%))"} maxW={"full"} py={9}>
          <ModalCloseButton fontSize={"11px"} />
          <ModalHeader display={"flex"} justifyContent={"space-between"} p={0} px={"2.75rem"}>
            <Text as={"h2"} fontSize={"2xl"}>
              {t("requirementsLibrary.modals.create.title")}
            </Text>
            <HStack>
              <Button variant={"primary"}>{t("ui.save")}</Button>
              <Button variant={"secondary"}>{t("ui.cancel")}</Button>
            </HStack>
          </ModalHeader>
          <ModalBody px={"2.75rem"}>
            <HStack spacing={9} w={"full"} h={"full"}>
              <BlockSetup />
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
})
