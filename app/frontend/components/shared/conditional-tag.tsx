import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface ConditionalTagProps extends TagProps {
  hasConditional?: boolean
}

export const ConditionalTag: React.FC<ConditionalTagProps> = ({ hasConditional, ...rest }) => {
  const { t } = useTranslation()

  const isConditionalText = t("requirementsLibrary.conditional")
  const hasConditionalText = t("requirementsLibrary.hasConditional")

  return (
    <Tag
      bg={"semantic.infoLight"}
      border="1px solid"
      borderColor={"semantic.info"}
      color={"text.secondary"}
      fontWeight={700}
      fontSize={"xs"}
      {...rest}
    >
      {hasConditional ? hasConditionalText : isConditionalText}
    </Tag>
  )
}
