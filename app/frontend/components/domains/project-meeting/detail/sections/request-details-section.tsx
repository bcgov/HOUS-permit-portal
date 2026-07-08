import { Box, HStack, Text, VStack } from "@chakra-ui/react"
import { Check } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { DetailSection } from "../detail-section"

interface RequestDetailsSectionProps {
  projectMeeting: IProjectMeeting
}

export const RequestDetailsSection = ({ projectMeeting }: RequestDetailsSectionProps) => {
  const { t } = useTranslation()
  const notProvided = t("ui.notProvided")

  return (
    <DetailSection title={t("projectMeeting.detail.requestDetails")}>
      <VStack align="stretch" spacing={5}>
        <Box>
          <Text fontWeight="bold" mb={2}>
            {t("projectMeeting.projectDescription")}
          </Text>
          <Text whiteSpace="pre-wrap">{projectMeeting.projectDescription || notProvided}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={2}>
            {t("projectMeeting.detail.requesterNotesAndQuestions")}
          </Text>
          <Text whiteSpace="pre-wrap">{projectMeeting.meetingNotes || notProvided}</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={2}>
            {t("projectMeeting.detail.propertyInformationRequested")}
          </Text>
          <HStack spacing={1}>
            {projectMeeting.requestPropertyInformation && <Check size={18} />}
            <Text>
              {projectMeeting.requestPropertyInformation === null
                ? notProvided
                : projectMeeting.requestPropertyInformation
                  ? t("ui.yes")
                  : t("ui.no")}
            </Text>
          </HStack>
        </Box>
      </VStack>
    </DetailSection>
  )
}
