import { Flex, Heading, Link, ListItem, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { t } from "i18next"
import { ArrowSquareOut }  from "@phosphor-icons/react"
import React from "react"

export const Info = function StepCodeInfo() {
  return (
    <VStack spacing={4} p={4} w="full" align="start" rounded="lg" bg="theme.blueLight" color="theme.blueAlt">
      <Heading as="h4" fontSize="lg">
        {t("stepCode.info.title")}
        <Link href="https://www2.gov.bc.ca/gov/content/housing-tenancy/building-or-renovating/permits/building-permit-hub/29065#Reports" isExternal>
          <ArrowSquareOut />
        </Link>
      </Heading>
      <UnorderedList>
        <ListItem>{t("stepCode.info.energy")}</ListItem>
        <ListItem>{t("stepCode.info.zeroCarbon")}</ListItem>
      </UnorderedList>
      <Flex direction="column">
        <Heading as="h4" fontSize="md">
          {t("stepCode.info.performancePaths.title")}
        </Heading>
        <UnorderedList>
          <ListItem>{t("stepCode.info.performancePaths.ers")}</ListItem>
          <ListItem>{t("stepCode.info.performancePaths.necb")}</ListItem>
          <ListItem>{t("stepCode.info.performancePaths.passive")}</ListItem>
          <ListItem>{t("stepCode.info.performancePaths.stepCode")}</ListItem>
        </UnorderedList>
      </Flex>
      <Text>
        {t("stepCode.info.more.prompt")}
        <Link href="https://energystepcode.ca" isExternal>
          {t("stepCode.info.more.link")}
        </Link>
      </Text>
    </VStack>
  )
}
