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
    [EPermitApplicationStatus.newlySubmitted]: "theme.yellow",
    [EPermitApplicationStatus.resubmitted]: "theme.yellow",
    [EPermitApplicationStatus.newDraft]: "theme.blueLight",
    [EPermitApplicationStatus.revisionsRequested]: "semantic.errorLight",
    [EPermitApplicationStatus.ephemeral]: "theme.blueLight",
  }

  const colorMap = {
    [EPermitApplicationStatus.newlySubmitted]: "text.primary",
    [EPermitApplicationStatus.resubmitted]: "text.primary",
    [EPermitApplicationStatus.newDraft]: "text.primary",
    [EPermitApplicationStatus.revisionsRequested]: "semantic.error",
    [EPermitApplicationStatus.ephemeral]: "text.primary",
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
      textAlign="center"
      {...rest}
    >
      {/* @ts-ignore */}
      {t(`permitApplication.status.${permitApplication.status}`)}
    </Tag>
  )
}
