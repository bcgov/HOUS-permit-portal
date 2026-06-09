import { Box, Button, HStack, Link, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { CopyLinkButton } from "../../../../shared/base/copy-link-button"
import { FormattedDateTime } from "../formatted-date-time"

interface ReviewerScheduledMeetingBannerProps {
  projectMeeting: IProjectMeeting
}

export const ReviewerScheduledMeetingBanner = ({ projectMeeting }: ReviewerScheduledMeetingBannerProps) => {
  const { t } = useTranslation()

  return (
    <Box bg="theme.blueLight" borderRadius="lg" p={5} mb={8} maxW="xl">
      <VStack align="stretch" spacing={4}>
        <Box>
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            {t("projectMeeting.detail.reviewer.scheduledTitle")}
          </Text>
          <Text fontSize="lg">{t("projectMeeting.detail.reviewer.scheduledDescription")}</Text>
        </Box>

        {projectMeeting.contactMethod && (
          <HStack spacing={4} align="flex-start">
            <Text fontWeight="bold">{t("projectMeeting.detail.reviewer.contactMethodSummary")}</Text>
            <Text>{t(`projectMeeting.contactMethods.${projectMeeting.contactMethod}`)}</Text>
          </HStack>
        )}

        {projectMeeting.meetingUrl && (
          <Box>
            <HStack spacing={4} flexWrap="wrap">
              <CopyLinkButton
                value={projectMeeting.meetingUrl}
                label={t("projectMeeting.detail.reviewer.copyMeetingLink")}
                variant="link"
                size="sm"
                px={0}
                rightIcon={undefined}
                textDecoration="underline"
              />
              <Link href={projectMeeting.meetingUrl} isExternal color="text.link" textDecoration="underline">
                {t("projectMeeting.detail.reviewer.joinMeeting")}
              </Link>
            </HStack>
          </Box>
        )}

        {projectMeeting.confirmedDate && (
          <HStack spacing={4} align="flex-start">
            <Text fontWeight="bold">{t("projectMeeting.detail.reviewer.dateAndTime")}</Text>
            <Text>
              <FormattedDateTime date={projectMeeting.confirmedDate} />
            </Text>
          </HStack>
        )}

        {/* TODO - Change meeting details — wire up when reviewer scheduling edit flow is implemented */}
        <Button variant="secondary" size="sm" isDisabled alignSelf="flex-start">
          {t("projectMeeting.detail.reviewer.changeMeetingDetails")}
        </Button>
      </VStack>
    </Box>
  )
}
