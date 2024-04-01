import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface ElectiveTagProps {
  hasElective?: boolean
}

export function ElectiveTag(props: Partial<ElectiveTagProps & TagProps>) {
  const { t } = useTranslation()

  const isElective = t("requirementsLibrary.elective")
  const hasElective = t("requirementsLibrary.hasElective")

  return (
    <Tag bg={"theme.yellowLight"} color={"text.secondary"} fontWeight={700} fontSize={"xs"} {...props}>
      {props.hasElective ? hasElective : isElective}
    </Tag>
  )
}
