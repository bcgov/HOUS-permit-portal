import { Button, Dialog, Flex, Portal, useDisclosure } from "@chakra-ui/react"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface IConfirmationModalProps {
  onConfirm: () => void // Function type for the confirmation action
  promptMessage?: string | ReactNode
  promptHeader?: string
  confirmText?: string
  renderTrigger: (onOpen: () => void) => ReactNode
}

export const ConfirmationModal = ({
  onConfirm,
  promptMessage,
  promptHeader,
  confirmText,
  renderTrigger,
}: IConfirmationModalProps) => {
  const { open, onOpen, onClose } = useDisclosure()
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
      <Dialog.Root
        open={open}
        size="lg"
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content p={4}>
              <Dialog.Header>{promptHeader ?? t("ui.defaultConfirmation")}</Dialog.Header>
              <Dialog.CloseTrigger />
              <Dialog.Body>{promptMessage ?? t("ui.confirm")}</Dialog.Body>
              <Dialog.Footer>
                <Flex justify="flex-start" w="full" gap={4}>
                  <Button variant="primary" onClick={handleConfirm}>
                    {confirmText ?? t("ui.confirm")}
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    {t("ui.neverMind")}
                  </Button>
                </Flex>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
}

export default ConfirmationModal
