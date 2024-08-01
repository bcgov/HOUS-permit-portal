import { Tag } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export const FirstNationsTag = () => {
  const { t } = useTranslation()
  return (
    <Tag p={1} px={2} backgroundColor={"semantic.successLight"}>
      {t("requirementTemplate.fields.firstNations")}
    </Tag>
  )
}
