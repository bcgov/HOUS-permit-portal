import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EPermitApplicationSubstatus } from "../../../types/enums"

interface IPermitApplicationStatusTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationStatusTag = ({ permitApplication, ...rest }: IPermitApplicationStatusTagProps) => {
  const { t } = useTranslation()

  const bgMap = {
    [EPermitApplicationSubstatus.submitted]: "theme.yellow",
    [EPermitApplicationSubstatus.resubmitted]: "theme.yellow",
    [EPermitApplicationSubstatus.viewed]: "greys.grey03",
    [EPermitApplicationSubstatus.draft]: "theme.blueLight",
    [EPermitApplicationSubstatus.revisionsRequested]: "semantic.errorLight",
    [EPermitApplicationSubstatus.revisionsViewed]: "greys.grey03",
  }

  const colorMap = {
    [EPermitApplicationSubstatus.submitted]: "text.primary",
    [EPermitApplicationSubstatus.resubmitted]: "text.primary",
    [EPermitApplicationSubstatus.viewed]: "text.primary",
    [EPermitApplicationSubstatus.draft]: "text.primary",
    [EPermitApplicationSubstatus.revisionsRequested]: "semantic.error",
    [EPermitApplicationSubstatus.revisionsViewed]: "text.primary",
  }

  return (
    <Tag
      p={1}
      bg={bgMap[permitApplication.substatus]}
      color={colorMap[permitApplication.substatus]}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      minW="fit-content"
      {...rest}
    >
      {/* @ts-ignore */}
      {t(`permitApplication.substatus.${permitApplication.substatus}`)}
    </Tag>
  )
}
