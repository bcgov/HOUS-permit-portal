import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { SwitchButton } from "../../../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../../../shared/navigation/router-link-button"
import { SubmissionsInboxSetupScreen } from "../submissions-inbox-setup-screen"

interface InboxFeatureAccessScreenProps {
  backUrl: string
  isEnabled: boolean
  editPageUrl: string
  onToggle: (checked: boolean) => void
}

export const InboxFeatureAccessScreen: React.FC<InboxFeatureAccessScreenProps> = ({
  backUrl,
  isEnabled,
  editPageUrl,
  onToggle,
}) => {
  const i18nPrefix = "home.configurationManagement.featureAccess"
  const { t } = useTranslation()

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <RouterLinkButton variant={"link"} to={backUrl} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </RouterLinkButton>
        <Flex align="center" w="100%" direction="column" alignItems="flex-start">
          <Heading as="h1" m={0}>
            {/* ts-ignore */}
            {t(`${i18nPrefix}.submissionInbox`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            <Trans
              i18nKey={`${i18nPrefix}.submissionInboxDescription`}
              components={{
                1: (
                  <RouterLinkButton
                    variant={"link"}
                    to={editPageUrl}
                    fontSize="lg"
                    textDecoration="none"
                  ></RouterLinkButton>
                ),
              }}
            />
          </Text>
        </Flex>
      </VStack>
      <>
        <SubmissionsInboxSetupScreen />
        <Flex mt={8} align="center" w="100%" direction="column" alignItems="flex-start">
          <Heading as="h2" fontSize="2xl" fontWeight="bold" m={0} mb={2}>
            {t(`${i18nPrefix}.acceptPermitApplications`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mb={2} mt={2}>
            {t(`${i18nPrefix}.switchButtonInstructions`)}
          </Text>
          <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} />
        </Flex>
      </>
    </Container>
  )
}
