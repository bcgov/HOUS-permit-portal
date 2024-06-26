import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EPermitApplicationStatus } from "../../../types/enums"

interface IPermitApplicationStatusTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationStatusTag = ({ permitApplication, ...rest }: IPermitApplicationStatusTagProps) => {
  const { t } = useTranslation()

  const bgMap = {
    [EPermitApplicationStatus.submitted]: "theme.yellow",
    [EPermitApplicationStatus.draft]: "theme.blueLight",
  }

  const colorMap = {
    [EPermitApplicationStatus.submitted]: "text.link",
    [EPermitApplicationStatus.draft]: "text.link",
  }

  return (
    <Tag
      p={1}
      bg={bgMap[permitApplication.status]}
      color={colorMap[permitApplication.status]}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      minW="fit-content"
      {...rest}
    >
      {permitApplication.statusTagText}
    </Tag>
  )
}
