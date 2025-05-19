import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import { SubmissionsInboxSetupScreen } from "../../domains/home/review-manager/configuration-management-screen/submissions-inbox-setup-screen"
import { SwitchButton } from "../buttons/switch-button"
import { RouterLinkButton } from "../navigation/router-link-button"

interface FeatureToggleScreenProps {
  i18nPrefix: string
  featureKey: string
  backUrl: string
  isEnabled: boolean
  onToggle: (checked: boolean) => void
}

export const FeatureToggleScreen: React.FC<FeatureToggleScreenProps> = ({
  i18nPrefix,
  featureKey,
  backUrl,
  isEnabled,
  onToggle,
}) => {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <RouterLinkButton variant={"link"} to={backUrl} leftIcon={<CaretLeft size={20} />} textDecoration="none">
          {t("ui.back")}
        </RouterLinkButton>
        <Flex align="center" w="100%" direction="column" alignItems="flex-start">
          <Heading as="h1" m={0}>
            {/* ts-ignore */}
            {t(`${i18nPrefix}.${featureKey}`)}
          </Heading>
          <Text color="text.secondary" fontSize="lg" mt={2}>
            {/* ts-ignore */}
            {t(`${i18nPrefix}.${featureKey}Description`)}
          </Text>
        </Flex>
        {/* ts-ignore */}
        <Flex justify="space-between" w="100%">
          {!location.pathname.endsWith("/submissions-inbox-setup") && (
            <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} />
          )}
        </Flex>
      </VStack>
      {location.pathname.endsWith("/submissions-inbox-setup") && (
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
      )}
    </Container>
  )
}
