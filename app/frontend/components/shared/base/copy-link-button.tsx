import { Button, ButtonProps } from "@chakra-ui/react"
import { Link } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"

interface ICopyableNumberProps extends ButtonProps {
  value: string
  label?: string
}

export const CopyLinkButton = ({ value, label, ...rest }: ICopyableNumberProps) => {
  const { t } = useTranslation()
  const { uiStore } = useMst()

  const handleClickCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      uiStore.flashMessage.show(EFlashMessageStatus.info, null, t("ui.copied"), 3000)
    } catch (error) {
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("ui.failedToCopy"), 3000)
    }
  }

  return (
    <Button
      aria-label={"copy link"}
      rightIcon={<Link />}
      onClick={handleClickCopy}
      variant="secondary"
      size="sm"
      {...rest}
    >
      {label || t("ui.copy")}
    </Button>
  )
}
