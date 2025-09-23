import { Button, ButtonProps, IconButton, IconButtonProps } from "@chakra-ui/react"
import { Copy } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"

interface ICopyLinkButtonProps extends Omit<ButtonProps, "aria-label"> {
  value: string
  label?: string
  iconOnly?: boolean
  "aria-label"?: string
}

export const CopyLinkButton = ({ value, label, iconOnly, "aria-label": ariaLabel, ...rest }: ICopyLinkButtonProps) => {
  const { t } = useTranslation()
  const { uiStore } = useMst()

  const handleClickCopy = async (e) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(value)
      uiStore.flashMessage.show(EFlashMessageStatus.info, null, t("ui.copied"), 3000)
    } catch (error) {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("ui.failedToCopy"), 3000)
    }
  }

  if (iconOnly) {
    return (
      <IconButton
        aria-label={ariaLabel || t("ui.copyValue")}
        icon={<Copy />}
        onClick={handleClickCopy}
        variant="ghost"
        size="sm"
        {...(rest as IconButtonProps)}
      />
    )
  }

  return (
    <Button
      aria-label={ariaLabel || "copy link"}
      rightIcon={<Copy />}
      onClick={handleClickCopy}
      variant="secondary"
      size="sm"
      {...rest}
    >
      {label || t("ui.copy")}
    </Button>
  )
}
