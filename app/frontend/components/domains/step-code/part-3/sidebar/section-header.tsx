import { Heading } from "@chakra-ui/react"
import React from "react"

export const SectionHeader = function StepCodeSidebarSectionHeader({ title }) {
  return (
    <Heading as="h3" fontSize="sm" textTransform="uppercase" px={4} py={2}>
      {title}
    </Heading>
  )
}
