import { Box, Flex, Heading, Link, Text } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { EResourceCategory } from "../../../types/enums"
import { ResourceItem } from "../base/resource-item"

interface IJurisdictionResourcesSectionProps {
  jurisdiction: IJurisdiction
  showTitle?: boolean
  showDescription?: boolean
  configureResourcesPath?: string
}

export const JurisdictionResourcesSection = ({
  jurisdiction,
  showTitle = true,
  showDescription = true,
  configureResourcesPath,
}: IJurisdictionResourcesSectionProps) => {
  const { t } = useTranslation()

  const hasResources = jurisdiction.resources && jurisdiction.resources.length > 0

  if (!hasResources && !configureResourcesPath) {
    return null
  }

  if (!hasResources && configureResourcesPath) {
    return (
      <Flex as="section" direction="column" gap={4}>
        {showTitle && (
          <Heading as="h2" fontSize="xl" my={0}>
            {t("jurisdiction.resources.sectionTitle")}
          </Heading>
        )}
        <Text color="text.secondary" fontSize="sm" mt={1}>
          {t("jurisdiction.resources.emptyForStaff")}{" "}
          <Link
            target="_blank"
            as={RouterLink}
            to={configureResourcesPath}
            color="theme.blueAlt"
            textDecoration="underline"
          >
            {t("jurisdiction.resources.configureResourcesLink")}
          </Link>
        </Text>
      </Flex>
    )
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
