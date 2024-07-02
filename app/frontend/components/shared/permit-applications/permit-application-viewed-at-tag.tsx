import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"

interface IPermitApplicationViewedAtTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationViewedAtTag = ({ permitApplication, ...rest }: IPermitApplicationViewedAtTagProps) => {
  const { t } = useTranslation()
  return (
    <Tag
      p={1}
      bg={permitApplication.wasViewed ? undefined : "theme.yellow"}
      color={"text.link"}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      minW="fit-content"
      {...rest}
    >
      {permitApplication.wasViewed
        ? t("permitApplication.substatus.viewed")
        : t("permitApplication.substatus.notViewed")}
    </Tag>
  )
}
