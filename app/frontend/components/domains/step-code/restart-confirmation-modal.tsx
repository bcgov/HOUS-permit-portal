import {
  Button,
  ButtonGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { ArrowCounterClockwise } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { useMst } from "../../../setup/root"

export const RestartConfirmationModal = observer(function RestartStepCodeConfirmationModal() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { stepCodeStore } = useMst()

  const handleDeleteStepCode = async () => {
    await stepCodeStore.deleteStepCode()
    onClose()
  }

  return (
    <>
      <Button variant="tertiary" rightIcon={<ArrowCounterClockwise />} onClick={onOpen}>
        {t("stepCode.restart.trigger")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize={"2xl"} mt={2}>
            {t("stepCode.restart.confirm.title")}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>{t("stepCode.restart.confirm.body")}</ModalBody>

          <ModalFooter justifyContent={"flex-start"}>
            <ButtonGroup spacing={4}>
              <Button variant={"primary"} onClick={handleDeleteStepCode} leftIcon={<ArrowCounterClockwise />}>
                {t("stepCode.restart.trigger")}
              </Button>
              <Button variant={"secondary"} onClick={onClose}>
                {t("ui.neverMind")}
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})
