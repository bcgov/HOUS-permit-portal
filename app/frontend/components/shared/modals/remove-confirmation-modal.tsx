import { X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { ConfirmationModal, IConfirmationModalProps } from "../confirmation-modal"

interface IProps extends Omit<IConfirmationModalProps, "onConfirm"> {
  onRemove?: (closeModal: () => void) => void
}

export const RemoveConfirmationModal = observer(function RemoveConfirmationModal({
  onRemove,
  triggerButtonProps,
  ...rest
}: IProps) {
  const { t } = useTranslation()

  return (
    <ConfirmationModal
      triggerText={t("ui.remove")}
      onConfirm={onRemove}
      triggerButtonProps={{
        leftIcon: <X />,
        color: "error",
        ...triggerButtonProps,
      }}
      {...rest}
    />
  )
})
