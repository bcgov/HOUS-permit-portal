import {
  Button,
  ButtonProps,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

interface ICreateEarlyAccessVersionModalProps {
  onCreateEarlyAccessVersion?: () => Promise<void> | void
  triggerButtonProps?: Partial<ButtonProps>
  renderTrigger?: (onOpen: () => void) => React.ReactNode
}

export const CreateEarlyAccessVersionModal = observer(function CreateEarlyAccessVersionModal({
  onCreateEarlyAccessVersion,
  triggerButtonProps,
  renderTrigger,
}: ICreateEarlyAccessVersionModalProps) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCreating, setIsCreating] = useState(false)

  const onConfirm = async () => {
    setIsCreating(true)
    try {
      await onCreateEarlyAccessVersion?.()
      onClose()
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <>
      {renderTrigger ? (
        renderTrigger(onOpen)
      ) : (
        <Button variant="secondary" onClick={onOpen} {...triggerButtonProps}>
          {t("requirementTemplate.edit.createEarlyAccessVersion")}
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent w="full" maxW="436px" mx={4}>
          <ModalHeader fontSize={"2xl"} mt={2}>
            {t("requirementTemplate.edit.earlyAccessModalTitle")}
          </ModalHeader>
          <ModalBody>
            <Text>{t("requirementTemplate.edit.earlyAccessModalBody")}</Text>
          </ModalBody>
          <ModalFooter justifyContent={"flex-start"} mt={4} gap={3}>
            <Button variant={"primary"} onClick={onConfirm} isLoading={isCreating}>
              {t("ui.confirm")}
            </Button>
            <Button variant={"secondary"} onClick={onClose} isDisabled={isCreating}>
              {t("ui.neverMind")}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})
