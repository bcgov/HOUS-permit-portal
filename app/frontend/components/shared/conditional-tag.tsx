import { Tag } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const ConditionalTag: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Tag
      bg={"semantic.infoLight"}
      border="1px solid"
      borderColor={"semantic.info"}
      color={"text.secondary"}
      fontWeight={700}
      fontSize={"xs"}
    >
      {t("requirementsLibrary.conditional")}
    </Tag>
  )
}
