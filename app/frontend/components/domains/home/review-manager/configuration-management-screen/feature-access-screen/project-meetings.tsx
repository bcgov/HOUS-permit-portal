import { Button, Container, Flex, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { ESubmissionContactClass } from "../../../../../../types/enums"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { SwitchButton } from "../../../../../shared/buttons/switch-button"
import { SubmissionContactForm } from "../shared/submission-contact-form"

export const ProjectMeetingsJurisdictionFeatureAccessScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { currentJurisdiction, error: jurisdictionError } = useJurisdiction()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const projectMeetingsEnabled = currentJurisdiction?.projectMeetingsEnabled ?? false
  const propertyInformationRequestsEnabled = currentJurisdiction?.propertyInformationRequestsEnabled ?? false

  const handleProjectMeetingsToggle = () => {
    currentJurisdiction?.update({ projectMeetingsEnabled: !projectMeetingsEnabled })
  }

  const handlePropertyInformationToggle = (checked: boolean) => {
    currentJurisdiction?.update({ propertyInformationRequestsEnabled: checked })
  }

  const recipientHeading = (label: string) => (
    <VStack align="flex-start" spacing={3}>
      <Text fontSize="md" fontWeight="normal">
        {t(`${i18nPrefix}.sendRequestsFor`)}
      </Text>
      <Text fontSize="lg" fontWeight="bold">
        {label}
      </Text>
    </VStack>
  )

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
        <Flex mt={8} align="flex-start" w="100%" direction="column" gap={8}>
          <Flex align="flex-start" w="100%" direction="column">
            <Flex
              align="center"
              justify="space-between"
              w="100%"
              borderBottomWidth={1}
              borderColor="border.light"
              pb={2}
            >
              <Heading as="h2" fontSize="lg" fontWeight="bold" m={0}>
                {t(`${i18nPrefix}.acceptProjectMeetings`)}
              </Heading>
              <Button variant={projectMeetingsEnabled ? "secondary" : "primary"} onClick={handleProjectMeetingsToggle}>
                {t(`${i18nPrefix}.${projectMeetingsEnabled ? "turnOffProjectMeetings" : "turnOnProjectMeetings"}`)}
              </Button>
            </Flex>
          </Flex>

          <Flex align="flex-start" w="100%" direction="column" gap={2}>
            <Heading as="h2" fontSize="lg" fontWeight="bold" m={0}>
              {t(`${i18nPrefix}.projectMeetingsResources`)}
            </Heading>
            <Text color="text.secondary" fontSize="md">
              {t(`${i18nPrefix}.projectMeetingsResourcesDescription`)}
            </Text>
            <Link
              color="text.link"
              onClick={() =>
                navigate(
                  `/jurisdictions/${currentJurisdiction.slug || currentJurisdiction.id}/configuration-management/resources?openAddResource=project_meeting_authorization`
                )
              }
            >
              {t(`${i18nPrefix}.projectMeetingsResourcesLink`)}
            </Link>
          </Flex>

          <SubmissionContactForm
            jurisdiction={currentJurisdiction}
            heading={recipientHeading(t(`${i18nPrefix}.projectMeetings`))}
            contactClass={ESubmissionContactClass.meeting}
            emailLabel={t(`${i18nPrefix}.projectMeetingsEmailLabel`)}
            addEmailLabel={t(`${i18nPrefix}.projectMeetingsAddEmail`)}
            confirmationRequiredLabel={t(`${i18nPrefix}.projectMeetingsConfirmationRequired`)}
          />

          {projectMeetingsEnabled && (
            <>
              <Flex align="center" w="100%" justify="space-between" gap={6}>
                <Flex align="flex-start" direction="column">
                  <Heading as="h2" fontSize="lg" fontWeight="bold" m={0} mb={2}>
                    {t(`${i18nPrefix}.propertyInformationRequests`)}
                  </Heading>
                  <Text color="text.secondary" fontSize="md">
                    {t(`${i18nPrefix}.propertyInformationRequestsDescription`)}
                  </Text>
                </Flex>
                <SwitchButton
                  isChecked={propertyInformationRequestsEnabled}
                  onChange={(e) => handlePropertyInformationToggle(e.target.checked)}
                  size={"lg"}
                />
              </Flex>

              <SubmissionContactForm
                jurisdiction={currentJurisdiction}
                heading={recipientHeading(t(`${i18nPrefix}.propertyInformation`))}
                contactClass={ESubmissionContactClass.propertyInformation}
                emailLabel={t(`${i18nPrefix}.propertyInformationEmailLabel`)}
                addEmailLabel={t(`${i18nPrefix}.propertyInformationAddEmail`)}
                confirmationRequiredLabel={t(`${i18nPrefix}.propertyInformationConfirmationRequired`)}
              />
            </>
          )}
        </Flex>
      )}
    </Container>
  )
})
