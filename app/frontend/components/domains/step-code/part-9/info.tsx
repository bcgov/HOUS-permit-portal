import { Flex, Heading, Link, List, Text, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import React from "react"

export const Info = function StepCodeInfo() {
  return (
    <VStack gap={4} p={4} w="full" align="start" rounded="lg" bg="theme.blueLight" color="theme.blueAlt">
      <Heading as="h4" fontSize="lg">
        {t("stepCode.info.title")}
      </Heading>
      <List.Root as="ul">
        <List.Item>{t("stepCode.info.energy")}</List.Item>
        <List.Item>{t("stepCode.info.zeroCarbon")}</List.Item>
      </List.Root>
      <Flex direction="column">
        <Heading as="h4" fontSize="md">
          {t("stepCode.info.performancePaths.title")}
        </Heading>
        <List.Root as="ul">
          <List.Item>{t("stepCode.info.performancePaths.ers")}</List.Item>
          <List.Item>{t("stepCode.info.performancePaths.necb")}</List.Item>
          <List.Item>{t("stepCode.info.performancePaths.passive")}</List.Item>
          <List.Item>{t("stepCode.info.performancePaths.stepCode")}</List.Item>
        </List.Root>
      </Flex>
      <Text>
        {t("stepCode.info.more.prompt")}
        <Link href="https://energystepcode.ca" target="_blank" rel="noopener noreferrer">
          {t("stepCode.info.more.link")}
        </Link>
      </Text>
    </VStack>
  )
}
