import { Flex } from "@chakra-ui/react"
import React from "react"
import { IHomeScreenProps } from "../../domains/home"
import { SharedSpinner } from "./shared-spinner"

export const LoadingScreen = ({ ...rest }: IHomeScreenProps) => {
  return (
    <Flex direction="column" align="center" justifyContent="center" w="full" height="70vh">
      <SharedSpinner h={24} w={24} marginY="8" marginX="auto" />
    </Flex>
  )
}
