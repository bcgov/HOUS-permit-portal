import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

export function ElectiveTag(props: Partial<TagProps>) {
  const { t } = useTranslation()
  return (
    <Tag bg={"theme.yellowLight"} color={"text.secondary"} fontWeight={700} fontSize={"xs"} {...props}>
      {t("requirementsLibrary.elective")}
    </Tag>
  )
}
