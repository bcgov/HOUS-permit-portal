import { Heading } from "@chakra-ui/react"
import React from "react"

interface ISectionHeaderProps {
  title: string
}

export function SectionHeader({ title }: ISectionHeaderProps) {
  return (
    <Heading as="h3" fontSize="sm" textTransform="uppercase" px={6} pt={2} my={0}>
      {title}
    </Heading>
  )
}
