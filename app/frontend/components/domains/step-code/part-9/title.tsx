import { Heading, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"

export const Title = function StepCodeTitle() {
  return (
    <VStack spacing={2} align="start" w="full">
      <Heading as="h3" fontSize="2xl" color="text.primary" mb={0}>
        {t("stepCode.title")}
      </Heading>
      <Text fontSize="md" color="text.primary">
        {t("stepCode.subTitle")}
      </Text>
    </VStack>
  )
}
