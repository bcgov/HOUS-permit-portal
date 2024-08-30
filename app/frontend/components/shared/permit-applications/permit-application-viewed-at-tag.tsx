import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { EPermitApplicationStatus } from "../../../types/enums"

interface IPermitApplicationViewedAtTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationViewedAtTag = ({ permitApplication, ...rest }: IPermitApplicationViewedAtTagProps) => {
  const { t } = useTranslation()

  const statusMap = {
    [EPermitApplicationStatus.newlySubmitted]: t("permitApplication.notViewed"),
    [EPermitApplicationStatus.resubmitted]: t("permitApplication.newlyRevised"),
  }
  return (
    <Tag
      p={1}
      bg={permitApplication.isViewed ? undefined : "theme.yellow"}
      color={"text.primary"}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      minW="fit-content"
      textAlign="center"
      {...rest}
    >
      {permitApplication.isViewed ? t("permitApplication.viewed") : statusMap[permitApplication.status]}
    </Tag>
  )
}
