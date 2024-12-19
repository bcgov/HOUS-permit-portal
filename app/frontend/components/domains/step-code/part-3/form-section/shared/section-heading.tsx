import { Heading, HeadingProps } from "@chakra-ui/react"
import React from "react"

export function SectionHeading({ children, ...props }: HeadingProps) {
  return (
    <Heading as="h2" fontSize="2xl" variant="yellowline" pt={4} m={0} {...props}>
      {children}
    </Heading>
  )
}
