import { Flex, Text } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"
import { SharedSpinner } from "./shared-spinner"

interface ILoadingScreenProps {
  message?: string
}

export const LoadingScreen = ({ message = t("site.loading") }: ILoadingScreenProps) => {
  return (
    <Flex direction="column" align="center" justifyContent="center" w="full" height="70vh">
      <SharedSpinner h={24} w={24} marginY="8" marginX="auto" />
      {message && (
        <Text color="text.secondary" fontSize="xl">
          {message}
        </Text>
      )}
    </Flex>
  )
}
