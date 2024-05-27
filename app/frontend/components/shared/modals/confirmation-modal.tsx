import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalContentProps,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import React, { ReactNode, useState } from "react"
import { useTranslation } from "react-i18next"

export interface IConfirmationModalRenderTriggerProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}
export interface IConfirmationModalConfirmTriggerProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  isLoading: boolean
}
export interface IConfirmationModalDimissTriggerProps {
  onClick: React.MouseEventHandler<HTMLButtonElement>
  isDisabled: boolean
}

export type TConfirmationModalProps = {
  title: string | ReactNode
  confirmationText: string | ReactNode
  onConfirm: (e: React.MouseEvent<HTMLInputElement>) => Promise<any> | void
  onDismiss?: () => void
  confirmationButtonText?: string
  renderTrigger: (props: IConfirmationModalRenderTriggerProps) => JSX.Element
  renderConfirmTrigger?: (props: IConfirmationModalConfirmTriggerProps) => JSX.Element
  renderDismissTrigger?: (props: IConfirmationModalDimissTriggerProps) => JSX.Element
  renderAdditionalModalBodyComponents?: () => JSX.Element
  modalContentProps?: ModalContentProps
  emitModalOpenState?: (isOpen: boolean) => void
  onClickConfirm?: (params: {
    setIsSubmitting: (isSubmitting: boolean) => void
    onClose: () => void
    onConfirm: () => Promise<any> | any
  }) => Promise<void> | void // This is used to override the internal click confirm flow (needed tto prevent memory leaks if confirmation removes reference item)
}

export const ConfirmationModal = ({
  onConfirm,
  onDismiss,
  renderTrigger,
  title,
  confirmationText,
  confirmationButtonText,
  renderConfirmTrigger,
  renderDismissTrigger,
  renderAdditionalModalBodyComponents,
  modalContentProps,
  emitModalOpenState,
  onClickConfirm,
}: TConfirmationModalProps) => {
  const { isOpen, onOpen: disclosureOnOpen, onClose: disclosureOnClose } = useDisclosure()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { t } = useTranslation()

  const onClose = () => {
    emitModalOpenState?.(false)
    disclosureOnClose()
  }

  const handleClickDismiss = () => {
    onDismiss?.()
    onClose()
  }

  const onOpen = () => {
    emitModalOpenState?.(true)
    disclosureOnOpen()
  }
  const handleClickConfirm = async (e) => {
    // prop to override internal click confirm
    // This is needed to prevent memory leaks if confirmation removes reference item)
    // as default flow will try to set state when item is unmounted in certain cases
    if (onClickConfirm) {
      onClickConfirm({ setIsSubmitting, onConfirm: () => onConfirm(e), onClose })
      return
    }

    // if no override function is passed
    setIsSubmitting(true)
    await onConfirm(e)
    onClose()
    setIsSubmitting(false)
  }

  const handleClickOpen = (e) => {
    // Prevents modal from opening (bubbling to parent)
    e.stopPropagation()
    e.preventDefault()
    onOpen()
  }

  return (
    <>
      {renderTrigger({ onClick: handleClickOpen })}

      <Modal isOpen={isOpen} onClose={onClose} blockScrollOnMount={false}>
        <ModalOverlay />
        <ModalContent {...modalContentProps}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>{confirmationText}</Text>
            {renderAdditionalModalBodyComponents?.()}
          </ModalBody>

          <ModalFooter>
            {(renderDismissTrigger &&
              renderDismissTrigger({ onClick: handleClickDismiss, isDisabled: isSubmitting })) || (
              <Button variant="secondary" mr={3} onClick={handleClickDismiss} isDisabled={isSubmitting}>
                {t("ui.neverMind")}
              </Button>
            )}
            {(renderConfirmTrigger &&
              renderConfirmTrigger({ onClick: handleClickConfirm, isLoading: isSubmitting })) || (
              <Button onClick={handleClickConfirm} variant="primary" isLoading={isSubmitting}>
                {confirmationButtonText || t("ui.confirm")}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
