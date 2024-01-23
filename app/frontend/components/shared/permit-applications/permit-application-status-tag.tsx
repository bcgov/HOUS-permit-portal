import { Tag } from "@chakra-ui/react"
import React from "react"

export const PermitApplicationTemplateStatusTag = ({ status }) => {
  return (
    <Tag
      p={1}
      fontWeight="bold"
      border="1px solid"
      borderColor="border.light"
      textTransform="uppercase"
      color="text.link"
    >
      {status}
    </Tag>
  )
}
