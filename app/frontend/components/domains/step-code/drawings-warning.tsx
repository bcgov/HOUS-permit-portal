import { HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { Warning } from "@phosphor-icons/react"
import { t } from "i18next"
import React from "react"

export const DrawingsWarning = function StepCodeWarning() {
  return (
    <VStack
      flex={1}
      spacing={2}
      align="start"
      w="full"
      rounded="lg"
      bg="semantic.warningLight"
      p={4}
      color="text.primary"
    >
      <HStack w="full">
        <Warning color="var(--chakra-colors-semantic-warning)" />
        <Heading as="h4" fontSize="md" mb={0}>
          {t("stepCode.drawingsWarning.title")}
        </Heading>
      </HStack>
      <Text pl={"26px"}>{t("stepCode.drawingsWarning.description")}</Text>
    </VStack>
  )
}
