import { HStack, IconButton, StackProps, Text } from "@chakra-ui/react"
import { Copy } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"

interface ICopyableNumberProps extends StackProps {
  value: string
  label: string
}

export const CopyableValue = ({ value, label, ...containerProps }: ICopyableNumberProps) => {
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
    <HStack gap={1} {...containerProps}>
      <Text mt={1}>
        {label}:{" "}
        <Text as="span" fontWeight={700}>
          {value}
        </Text>
      </Text>
      <IconButton
        aria-label={"copy value"}
        icon={<Copy />}
        onClick={handleClickCopy}
        variant="ghost"
        color="theme.yellow"
        size="sm"
      />
    </HStack>
  )
}
