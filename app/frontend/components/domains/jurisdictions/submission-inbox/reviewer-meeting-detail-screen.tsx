import { Box, Button, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { ArrowLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Navigate, Link as RouterLink, useLocation, useParams } from "react-router-dom"
import { useJurisdiction } from "../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../setup/root"
import { ErrorScreen } from "../../../shared/base/error-screen"
import { LoadingScreen } from "../../../shared/base/loading-screen"

export const ReviewerMeetingDetailScreen = observer(function ReviewerMeetingDetailScreen() {
  const { t } = useTranslation()
  const { jurisdictionId, meetingId } = useParams()
  const location = useLocation()
  const { siteConfigurationStore } = useMst()
  const { currentJurisdiction, error } = useJurisdiction()

  const projectMeetingsFlagLoaded = siteConfigurationStore.configurationLoaded && !!currentJurisdiction
  const projectMeetingsEnabled = Boolean(
    siteConfigurationStore.projectMeetingsEnabled && currentJurisdiction?.projectMeetingsEnabled
  )

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction || !jurisdictionId || !meetingId) return <LoadingScreen />
  if (projectMeetingsFlagLoaded && !projectMeetingsEnabled) {
    return <Navigate to={`/jurisdictions/${jurisdictionId}/submission-inbox${location.search}`} replace />
  }
  if (!projectMeetingsFlagLoaded || !projectMeetingsEnabled) return <LoadingScreen />

  return (
    <Flex as="main" h="calc(100vh - var(--app-navbar-height, 0px))" overflow="auto" bg="greys.grey03">
      <Box w="full" px={8} py={8}>
        <VStack align="start" spacing={6} maxW="container.lg">
          <Button
            as={RouterLink}
            to={`/jurisdictions/${jurisdictionId}/meetings`}
            variant="link"
            leftIcon={<ArrowLeft size={16} />}
          >
            {t("submissionInbox.projectDetail.backToInbox")}
          </Button>

          <Box bg="white" border="1px solid" borderColor="border.light" borderRadius="lg" p={8} w="full">
            <VStack align="start" spacing={3}>
              <Heading as="h1" size="lg">
                {t("submissionInbox.meetings")}
              </Heading>
              <Text color="text.secondary">Reviewer meeting detail workspace stub. Meeting ID: {meetingId}</Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </Flex>
  )
})
