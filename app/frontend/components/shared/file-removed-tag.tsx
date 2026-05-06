import { Tag } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const FileRemovedTag: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Tag.Root
      size="sm"
      variant="solid"
      color="text.secondary"
      backgroundColor="semantic.warningLight"
      borderRadius="sm"
      px={2}
    >
      <Tag.StartElement boxSize="12px" asChild>
        <Warning />
      </Tag.StartElement>
      <Tag.Label fontWeight="bold" fontSize="xs">
        {t("ui.fileRemoved")}
      </Tag.Label>
    </Tag.Root>
  )
}
