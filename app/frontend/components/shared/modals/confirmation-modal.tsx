import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface IConfirmationModalProps {
  onConfirm: () => void // Function type for the confirmation action
  promptMessage?: string
  promptHeader?: string
  renderTrigger: (onOpen: () => void) => ReactNode
}

export const ConfirmationModal = ({
  onConfirm,
  promptMessage,
  promptHeader,
  renderTrigger,
}: IConfirmationModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleCancel = () => {
    onClose()
  }

  return (
    <>
      {renderTrigger ? renderTrigger(onOpen) : <Button onClick={onOpen}>{t("ui.confirm")}</Button>}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent p={4}>
          <ModalHeader>{promptHeader ?? t("ui.confirmation")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{promptMessage ?? t("ui.confirm")}</ModalBody>
          <ModalFooter>
            <Flex justify="flex-start" w="full" gap={4}>
              <Button variant="primary" onClick={handleConfirm}>
                {t("ui.confirm")}
              </Button>
              <Button variant="secondary" onClick={handleCancel}>
                {t("ui.neverMind")}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ConfirmationModal
