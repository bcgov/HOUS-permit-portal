import { Button, Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { Suspense, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../../../hooks/resources/use-permit-classifications-load"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { SwitchButton } from "../../../../../shared/buttons/switch-button"
import { Form } from "./form"

export const SubmissionsInboxSetupScreen: React.FC = observer(function SubmissionsInboxSetupScreen() {
  const i18nPrefix = "home.configurationManagement.featureAccess" // from inbox-feature-access
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error: jurisdictionError } = useJurisdiction() // from both, aliased error
  const [isEnabled, setIsEnabled] = useState(currentJurisdiction?.inboxEnabled ?? false) // from inbox-feature-access

  const { isLoaded: permitClassificationsLoaded } = usePermitClassificationsLoad() // from original submissions-inbox-setup

  const handleToggle = (checked) => {
    setIsEnabled(checked)
    currentJurisdiction.update({ inboxEnabled: checked })
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
          <Heading as="h1" m={0}>
            {t(`${i18nPrefix}.submissionInbox`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            <Trans i18nKey={`${i18nPrefix}.submissionInboxDescription`} />
          </Text>
        </Flex>
      </VStack>
      {/* Content from original SubmissionsInboxSetupScreen's VStack */}
      <VStack spacing={8} align="start" w="full" mt={8}>
        <Suspense fallback={<LoadingScreen />}>
          {permitClassificationsLoaded && currentJurisdiction && <Form jurisdiction={currentJurisdiction} />}
        </Suspense>
      </VStack>
      {/* Content from InboxFeatureAccessScreen for the toggle */}
      <Flex mt={8} align="center" w="100%" direction="column" alignItems="flex-start">
        <Heading as="h2" fontSize="2xl" fontWeight="bold" m={0} mb={2}>
          {t(`${i18nPrefix}.acceptPermitApplications`)}
        </Heading>
        <Text color="text.secondary" fontSize="lg" mb={2} mt={2}>
          {t(`${i18nPrefix}.switchButtonInstructions`)}
        </Text>
        <SwitchButton isChecked={isEnabled} onChange={(e) => handleToggle(e.target.checked)} size={"lg"} />
      </Flex>
    </Container>
  )
})
