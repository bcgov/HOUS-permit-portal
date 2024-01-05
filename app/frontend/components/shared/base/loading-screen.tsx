import { Center } from "@chakra-ui/react"
import React from "react"
import { FullWhiteContainer } from "../../shared/containers/full-white-container"
import { SharedSpinner } from "./shared-spinner"

export const LoadingScreen = ({ ...rest }: IHomeScreenProps) => {
  return (
    <FullWhiteContainer>
      <Center w="full" flex={1}>
        <SharedSpinner h={24} w={24} />
      </Center>
    </FullWhiteContainer>
  )
}
