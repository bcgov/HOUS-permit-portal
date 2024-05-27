import { Button, ButtonProps, IconButton } from "@chakra-ui/react"
import React from "react"

import { Trash } from "@phosphor-icons/react"
import { useTranslation } from "react-i18next"
import { ConfirmationModal } from "./confirmation-modal"

interface IConfirmDeleteModalProps extends IMenuButtonProps {
  title?: string
  confirmationText?: string
  onConfirm: (event: React.MouseEvent<HTMLInputElement>) => Promise<any> | void
  compact?: boolean
  renderTrigger?: (onOpen) => JSX.Element
}

export const ConfirmDeleteModal = (props: IConfirmDeleteModalProps) => {
  const { onConfirm, title, compact, confirmationText, ...renderProps } = props
  const { t } = useTranslation()
  const renderTrigger = (confirmationModalProps) => {
    if (compact) {
      return (
        <IconButton
          aria-label="Delete item"
          variant="ghost"
          icon={<Trash size={4} color="semantic.error" />}
          {...renderProps}
          {...confirmationModalProps}
        />
      )
    } else {
      return (
        <MenuButton
          borderColor="gray.200"
          color="semantic.error"
          borderRadius="md"
          w="fit-content"
          variant="primary"
          leftIcon={<Trash />}
          _hover={{ bg: "gray.100" }}
          {...renderProps}
          {...confirmationModalProps}
        >
          {t("ui.delete")}
        </MenuButton>
      )
    }
  }

  return (
    <ConfirmationModal
      title={title}
      renderTrigger={(confirmationModalProps) =>
        props.renderTrigger ? props.renderTrigger(confirmationModalProps) : renderTrigger(confirmationModalProps)
      }
      confirmationButtonText={t("ui.confirmDelete")}
      confirmationText={confirmationText || t("ui.sureDelete")}
      onConfirm={onConfirm}
    />
  )
}

export interface IMenuButtonProps extends ButtonProps {}

export const MenuButton = ({ children, ...props }: IMenuButtonProps) => (
  <Button d="flex" w="100%" borderRadius={0} justifyContent="flex-start" variant="ghost" p={2} {...props}>
    {children}
  </Button>
)
