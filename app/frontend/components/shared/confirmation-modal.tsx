import {
  Button,
  ButtonGroup,
  ButtonProps,
  Dialog,
  ModalContentProps,
  ModalProps,
  Portal,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"

export interface IConfirmationModalProps {
  triggerButtonProps?: Partial<ButtonProps>
  confirmButtonProps?: Partial<ButtonProps>
  triggerText?: string
  renderTriggerButton?: (props: ButtonProps) => JSX.Element
  renderConfirmationButton?: (props: ButtonProps) => JSX.Element
  title?: string
  body?: string
  onConfirm?: (closeModal: () => void) => void | Promise<void>
  modalProps?: Partial<ModalProps>
  modalContentProps?: Partial<ModalContentProps>
  modalControlProps?: Partial<Omit<ReturnType<typeof useDisclosure>, "onToggle">>
}

export const ConfirmationModal = observer(function ConfirmationModal({
  triggerButtonProps,
  renderTriggerButton,
  triggerText,
  title,
  body,
  onConfirm,
  modalProps,
  modalContentProps,
  modalControlProps,
  confirmButtonProps,
  renderConfirmationButton,
}: IConfirmationModalProps) {
  const disclosureProps = useDisclosure()

  const disclosureOpen = () => {
    disclosureProps.onOpen()
  }

  const isOpen = modalControlProps?.isOpen ?? disclosureProps.open
  const onOpen = modalControlProps?.onOpen ?? disclosureOpen
  const onClose = modalControlProps?.onClose ?? disclosureProps.onClose

  const { t } = useTranslation()

  const isConfirmDisabled = confirmButtonProps?.isDisabled ?? false

  return (
    <>
      {renderTriggerButton ? (
        renderTriggerButton({ onClick: onOpen, ...triggerButtonProps })
      ) : (
        <Button variant={"ghost"} color={"text.link"} onClick={onOpen} {...triggerButtonProps}>
          {triggerText ?? (t as any)("ui.confirm")}
        </Button>
      )}
      <Dialog.Root
        open={open}
        {...modalProps}
        onOpenChange={(e) => {
          if (!e.open) {
            onClose()
          }
        }}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content {...modalContentProps}>
              {title && (
                <Dialog.Header fontSize={"2xl"} mt={2}>
                  {title}
                </Dialog.Header>
              )}
              <Dialog.CloseTrigger />
              {body && <Dialog.Body>{body}</Dialog.Body>}
              <Dialog.Footer justifyContent={"flex-start"}>
                <ButtonGroup gap={4}>
                  {renderConfirmationButton ? (
                    renderConfirmationButton({ onClick: () => onConfirm(onClose), isDisabled: isConfirmDisabled })
                  ) : (
                    <Button
                      variant={"primary"}
                      onClick={() => onConfirm(onClose)}
                      {...confirmButtonProps}
                      disabled={isConfirmDisabled}
                    >
                      {triggerText ?? (t as any)("ui.confirm")}
                    </Button>
                  )}
                  <Button variant={"secondary"} onClick={onClose}>
                    {(t as any)("ui.neverMind")}
                  </Button>
                </ButtonGroup>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
    </>
  )
})
