import { Tag, TagLabel, TagLeftIcon } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const FileRemovedTag: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Tag
      size="sm"
      variant="solid"
      color="text.secondary"
      backgroundColor="semantic.warningLight"
      borderRadius="sm"
      px={2}
    >
      <TagLeftIcon boxSize="12px" as={Warning} />
      <TagLabel fontWeight="bold" fontSize="xs">
        {t("ui.fileRemoved")}
      </TagLabel>
    </Tag>
  )
}
