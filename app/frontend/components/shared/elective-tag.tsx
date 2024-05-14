import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface ElectiveTagProps extends TagProps {
  hasElective?: boolean
}

export const ElectiveTag: React.FC<ElectiveTagProps> = ({ hasElective, ...rest }) => {
  const { t } = useTranslation()

  const isElectiveText = t("requirementsLibrary.elective")
  const hasElectiveText = t("requirementsLibrary.hasElective")

  return (
    <Tag bg={"theme.yellowLight"} color={"text.secondary"} fontWeight={700} fontSize={"xs"} {...rest}>
      {hasElective ? hasElectiveText : isElectiveText}
    </Tag>
  )
}
