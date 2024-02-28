import { Heading, VStack } from "@chakra-ui/react"
import React, { PropsWithChildren } from "react"

interface IProps {
  heading: string
}

export const ChecklistSection = function Section({ heading, children }: PropsWithChildren<IProps>) {
  return (
    <VStack borderWidth={1} borderColor="greys.grey02" rounded="base" p={5} w="full" align="start">
      <Heading as="h3" fontSize="lg">
        {heading}
      </Heading>
      {children}
    </VStack>
  )
}
