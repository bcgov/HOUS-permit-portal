import { Box, Flex, Heading, Link, Tag, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { IPermitProject } from "../../../models/permit-project"
// import { formatDate } from "../../../utils/utility-functions" // Commenting out as it might not exist

interface IPermitProjectCardProps {
  permitProject: IPermitProject
}

export const PermitProjectCard = observer(({ permitProject }: IPermitProjectCardProps) => {
  const { t } = useTranslation()
  // Using toLocaleDateString as a reliable fallback
  const displayDate = permitProject.updatedAt ? new Date(permitProject.updatedAt).toLocaleDateString() : "N/A"
  const submitterName = permitProject.submitter
    ? `${permitProject.submitter.firstName || ""} ${permitProject.submitter.lastName || ""}`.trim()
    : "N/A"

  return (
    <Link
      as={RouterLink}
      to={`/permit-projects/${permitProject.id}`} // Link to project detail page (to be created)
      _hover={{ textDecoration: "none" }}
      w="full"
      role="group"
    >
      <Box
        borderWidth="1px"
        borderColor="border.light"
        borderRadius="lg"
        p={6}
        bg="greys.white"
        _groupHover={{ shadow: "md" }}
        transitionProperty="common"
        transitionDuration="fast"
      >
        <VStack spacing={3} align="start">
          <Flex justify="space-between" w="full">
            <Heading size="md" noOfLines={2}>
              {permitProject.description || permitProject.nickname || t("permitProject.untitled", "Untitled Project")}
            </Heading>
            {permitProject.status && (
              <Tag size="sm">{t(`permitApplication.statusEnum.${permitProject.status}`, permitProject.status)}</Tag>
            )}
          </Flex>
          <Text fontSize="sm" color="text.secondary" noOfLines={1}>
            {t("permitProject.labels.number", "Project Number")}: {permitProject.number || "N/A"}
          </Text>
          <Text fontSize="sm" color="text.secondary" noOfLines={1}>
            {t("permitProject.labels.address", "Address")}: {permitProject.fullAddress || "N/A"}
          </Text>
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.labels.permitTypeAndActivity", "Permit Type & Activity")}:{" "}
            {permitProject.permitTypeAndActivity || "N/A"}
          </Text>
          <Text fontSize="sm" color="text.secondary">
            {t("permitProject.labels.submitter", "Submitter")}: {submitterName}
          </Text>
          <Text fontSize="xs" color="text.tertiary">
            {t("ui.updated", "Updated")}: {displayDate}
          </Text>
        </VStack>
      </Box>
    </Link>
  )
})
