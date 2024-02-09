import {
  Button,
  ButtonGroup,
  ButtonProps,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  triggerButtonProps?: Partial<ButtonProps>
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  title?: string
  body?: string
  onRemove?: (closeModal: () => void) => void
}

export const RemoveConfirmationModal = observer(function RemoveConfirmationModal({
  triggerButtonProps,
  renderTriggerButton,
  title,
  body,
  onRemove,
}: IProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()
  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: onOpen })
      ) : (
        <Button leftIcon={<X />} variant={"ghost"} color={"error"} onClick={onOpen} {...triggerButtonProps}>
          {t("ui.remove")}
        </Button>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          {title && (
            <ModalHeader fontSize={"2xl"} mt={2}>
              {title}
            </ModalHeader>
          )}
          <ModalCloseButton />
          {body && <ModalBody>{body}</ModalBody>}

          <ModalFooter>
            <ButtonGroup spacing={4}>
              <Button variant={"primary"} onClick={() => onRemove(onClose)}>
                {t("ui.remove")}
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
