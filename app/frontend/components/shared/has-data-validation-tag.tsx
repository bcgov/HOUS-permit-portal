import { Tag, TagProps } from "@chakra-ui/react"
import { Check } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"

export function HasDataValidationTag(props: Partial<TagProps>) {
  const { t } = useTranslation()
  return (
    <Tag bg={"semantic.infoLight"} color={"text.secondary"} fontWeight={700} fontSize={"xs"} {...props}>
      <Check style={{ marginRight: "var(--chakra-space-1)" }} />
      {t("requirementsLibrary.hasDataValidation")}
    </Tag>
  )
}
