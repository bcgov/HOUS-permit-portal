import { Modal, ModalContent, ModalOverlay, ModalProps, useDisclosure } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ConfirmationModal } from "./confirmation-modal"

interface IFormModalProps<T extends FieldValues> {
  isOpen: boolean
  onClose: () => void
  formProps: UseFormReturn<T>
  children: React.ReactNode
  modalProps?: Omit<ModalProps, "isOpen" | "onClose" | "children">
  confirmCloseTitle?: string
  confirmCloseBody?: string
  confirmCloseButtonText?: string
}

export const FormModal = observer(function FormModal<T extends FieldValues>({
  isOpen,
  onClose,
  formProps,
  children,
  modalProps,
  confirmCloseTitle,
  confirmCloseBody,
  confirmCloseButtonText,
}: IFormModalProps<T>) {
  const { t } = useTranslation()
  const {
    formState: { isDirty },
    reset,
  } = formProps

  const {
    isOpen: isConfirmationModalOpen,
    onOpen: onConfirmationModalOpen,
    onClose: onConfirmationModalClose,
  } = useDisclosure()

  const handleClose = () => {
    if (isDirty) {
      onConfirmationModalOpen()
    } else {
      reset()
      onClose()
    }
  }

  const handleConfirmClose = () => {
    reset()
    onClose()
    onConfirmationModalClose()
  }

  useEffect(() => {
    if (isOpen) {
      // We don't reset here because the parent component might want to set default values
      // or handle initialization. The parent is responsible for resetting the form
      // when the modal opens if needed, or we can rely on the form being reset on close.
    }
  }, [isOpen])

  return (
    <>
      <Modal onClose={handleClose} isOpen={isOpen} {...modalProps}>
        <ModalOverlay />
        <FormProvider {...formProps}>
          <ModalContent
            as={"form"}
            onClick={(e) => e.stopPropagation()}
            // Default styles that can be overridden by modalProps or children
            w={"min(1170px, 95%)"}
            maxW={"full"}
            {...(modalProps?.size ? {} : { w: "min(1170px, 95%)", maxW: "full" })}
          >
            {children}
          </ModalContent>
        </FormProvider>
      </Modal>

      <ConfirmationModal
        modalControlProps={{
          isOpen: isConfirmationModalOpen,
          onClose: onConfirmationModalClose,
        }}
        title={confirmCloseTitle || t("ui.confirmation.unsavedChangesTitle")}
        body={confirmCloseBody || t("ui.confirmation.unsavedChangesBody")}
        onConfirm={handleConfirmClose}
        confirmButtonProps={{
          children: confirmCloseButtonText || t("ui.confirmation.discardChanges"),
        }}
      />
    </>
  )
})
