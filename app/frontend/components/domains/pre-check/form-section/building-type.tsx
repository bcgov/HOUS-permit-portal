import { Box, Button, Flex, Heading, Tag, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { PreCheckBackLink } from "../pre-check-back-link"
import { usePreCheckNavigation } from "../use-pre-check-navigation"

export const BuildingType = observer(function BuildingType() {
  const { t } = useTranslation()
  const { navigateToNext, hasNext } = usePreCheckNavigation()

  return (
    <Box>
      <PreCheckBackLink />
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.buildingType.title", "Building Type")}
      </Heading>
      <Text mb={4}>
        {t(
          "preCheck.sections.buildingType.description",
          "Pre-checks are currently available for the following building type:"
        )}
      </Text>
      <Tag size="lg" colorScheme="blue" mb={6}>
        {t("preCheck.sections.buildingType.part9SmallBuilding", "Part 9 - Small Building")}
      </Tag>
      <Flex gap={3} mt={8} justifyContent="flex-start">
        <Button variant="primary" onClick={navigateToNext} isDisabled={!hasNext}>
          {t("ui.saveAndcontinue", "Save and Continue")}
        </Button>
      </Flex>
    </Box>
  )
})
