import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"
import { EPermitApplicationStatus } from "../../../types/enums"

interface IPermitApplicationStatusTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationStatusTag = ({ permitApplication, ...rest }: IPermitApplicationStatusTagProps) => {
  const bgMap = {
    [EPermitApplicationStatus.viewed]: "theme.blueAlt",
    [EPermitApplicationStatus.submitted]: "theme.yellow",
    [EPermitApplicationStatus.draft]: "theme.blueLight",
  }

  const colorMap = {
    [EPermitApplicationStatus.viewed]: "greys.white",
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
      {permitApplication.status}
    </Tag>
  )
}
