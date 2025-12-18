import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IJurisdiction } from "../../../models/jurisdiction"
import { EResourceCategory } from "../../../types/enums"
import { ResourceItem } from "../base/resource-item"

interface IJurisdictionResourcesSectionProps {
  jurisdiction: IJurisdiction
  showTitle?: boolean
  showDescription?: boolean
}

export const JurisdictionResourcesSection = ({
  jurisdiction,
  showTitle = true,
  showDescription = true,
}: IJurisdictionResourcesSectionProps) => {
  const { t } = useTranslation()

  if (!jurisdiction.resources || jurisdiction.resources.length === 0) {
    return null
  }

  return (
    <Flex as="section" direction="column" gap={4}>
      {showTitle && (
        <Heading as="h2" fontSize="xl" my={0}>
          {t("jurisdiction.resources.sectionTitle")}
        </Heading>
      )}
      {showDescription && (
        <Text color="text.secondary" fontSize="sm" mt={1}>
          {t("jurisdiction.resources.description")}
        </Text>
      )}
      {Object.values(EResourceCategory).map((category) => {
        const categoryResources = jurisdiction.resources.filter((r) => r.category === category)
        if (categoryResources.length === 0) return null

        return (
          <Box key={category} mb={4}>
            <Heading as="h3" mb={2} fontSize="lg">
              {t(`jurisdiction.resources.categories.${category as EResourceCategory}`)}
            </Heading>
            <Flex direction="column" gap={6}>
              {categoryResources.map((resource) => (
                <ResourceItem key={resource.id} resource={resource} />
              ))}
            </Flex>
          </Box>
        )
      })}
    </Flex>
  )
}
