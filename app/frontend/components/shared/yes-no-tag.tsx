import { Tag } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface IYesNoTagProps {
  boolean: boolean
}

export const YesNoTag = ({ boolean }: IYesNoTagProps) => {
  const { t } = useTranslation()
  return (
    <Tag p={1} px={2} backgroundColor={boolean ? "semantic.successLight" : "greys.grey03"}>
      {t(boolean ? "ui.yes" : "ui.no")}
    </Tag>
  )
}
