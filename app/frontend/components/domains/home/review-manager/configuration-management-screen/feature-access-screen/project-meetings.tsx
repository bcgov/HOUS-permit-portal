import { Button, Container, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { SwitchButton } from "../../../../../shared/buttons/switch-button"
import { ProjectMeetingsNotificationRecipientsForm } from "./project-meetings-notification-recipients-form"

export const ProjectMeetingsJurisdictionFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction, error: jurisdictionError } = useJurisdiction()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleToggle = (checked: boolean) => {
    currentJurisdiction?.update({ projectMeetingsEnabled: checked })
  }

  if (jurisdictionError) {
    return <ErrorScreen />
  }

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </Button>
        <Flex align="center" w="100%" direction="column" alignItems="flex-start">
          <Heading as="h1" mb={4}>
            {t(`${i18nPrefix}.projectMeetings`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            {t(`${i18nPrefix}.projectMeetingsDescription`)}
          </Text>
        </Flex>
      </VStack>
      {currentJurisdiction && (
        <Flex mt={8} align="flex-start" w="100%" direction="column">
          <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={2}>
            {t(`${i18nPrefix}.projectMeetingsNotificationRecipients`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mb={4}>
            {t(`${i18nPrefix}.projectMeetingsNotificationRecipientsDescription`)}
          </Text>
          <Suspense fallback={<LoadingScreen />}>
            <ProjectMeetingsNotificationRecipientsForm jurisdiction={currentJurisdiction} />
          </Suspense>
        </Flex>
      )}
      <Flex mt={8} align="center" w="100%" direction="column" alignItems="flex-start">
        <Flex direction="column" alignItems="flex-start">
          <Heading as="h2" fontSize="2xl" fontWeight="bold" m={0} mb={2}>
            {t(`${i18nPrefix}.acceptProjectMeetings`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mb={2} mt={2}>
            {t(`${i18nPrefix}.projectMeetingsResourcesDescription`)}
          </Text>
          <Link
            color="text.link"
            onClick={() =>
              currentJurisdiction &&
              navigate(
                `/jurisdictions/${currentJurisdiction.slug || currentJurisdiction.id}/configuration-management/resources`
              )
            }
          >
            {t(`${i18nPrefix}.projectMeetingsResourcesLink`)}
          </Link>
        </Flex>
        <SwitchButton
          isChecked={currentJurisdiction?.projectMeetingsEnabled ?? false}
          onChange={(e) => handleToggle(e.target.checked)}
          size={"lg"}
        />
      </Flex>
    </Container>
  )
})
