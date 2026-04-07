import { Box, Button, Flex, Heading, Link, SimpleGrid, Text } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { EFileUploadAttachmentType, EResourceType } from "../../../types/enums"
import { IResource } from "../../../types/types"
import { FileDownloadButton } from "../base/file-download-button"

interface IJurisdictionResourcesGridSectionProps {
  jurisdiction: IJurisdiction
  configureResourcesPath?: string
}

const ResourceGridItem = ({ resource }: { resource: IResource }) => {
  const showDescription = !!resource.description

  return (
    <Box minW={0}>
      {resource.resourceType === EResourceType.file && resource.resourceDocument ? (
        <FileDownloadButton
          document={resource.resourceDocument}
          modelType={EFileUploadAttachmentType.ResourceDocument}
          simpleLabel
          color="text.link"
          leftIcon={undefined}
          noOfLines={1}
        >
          {resource.title}
        </FileDownloadButton>
      ) : resource.resourceType === EResourceType.link && resource.linkUrl ? (
        <Link href={resource.linkUrl} isExternal noOfLines={1}>
          {resource.title}
        </Link>
      ) : null}
      {showDescription && (
        <Text color="text.secondary" fontSize="md" mt={1} noOfLines={1}>
          {resource.description}
        </Text>
      )}
    </Box>
  )
}

export const JurisdictionResourcesGridSection = ({
  jurisdiction,
  configureResourcesPath,
}: IJurisdictionResourcesGridSectionProps) => {
  const { t } = useTranslation()
  const hasResources = jurisdiction.resources && jurisdiction.resources.length > 0

  if (!hasResources && !configureResourcesPath) {
    return null
  }

  return (
    <Flex as="section" direction="column" gap={4}>
      <Heading as="h2" variant="yellowline" my={0}>
        {t("jurisdiction.resources.sectionTitle")}
      </Heading>
      <Box
        display="flex"
        flexDirection="column"
        border={configureResourcesPath ? "1px dashed" : undefined}
        borderColor={configureResourcesPath ? "border.light" : undefined}
        p={configureResourcesPath ? 1 : undefined}
        gap={1}
      >
        {configureResourcesPath && (
          <Flex justify="flex-end">
            <Button
              as={RouterLink}
              to={configureResourcesPath}
              target="_blank"
              rel="noopener noreferrer"
              rightIcon={<ArrowSquareOut size={14} />}
              size="xs"
              variant="primary"
            >
              {t("ui.edit")}
            </Button>
          </Flex>
        )}
        <Box bg="theme.gold" borderRadius="md" p={4}>
          {!hasResources ? (
            <Text color="text.secondary" fontSize="sm">
              {t("jurisdiction.resources.emptyForStaff")}
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              {jurisdiction.resources.map((resource) => (
                <ResourceGridItem key={resource.id} resource={resource} />
              ))}
            </SimpleGrid>
          )}
        </Box>
      </Box>
    </Flex>
  )
}
