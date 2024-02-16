import { Tag, TagProps } from "@chakra-ui/react"
import React from "react"
import { IPermitApplication } from "../../../models/permit-application"

interface IPermitApplicationStatusTagProps extends TagProps {
  permitApplication: IPermitApplication
}

export const PermitApplicationStatusTag = ({ permitApplication, ...rest }: IPermitApplicationStatusTagProps) => {
  return (
    <Tag
      p={1}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      color="text.link"
      minW="fit-content"
      {...rest}
    >
      {permitApplication.status}
    </Tag>
  )
}
