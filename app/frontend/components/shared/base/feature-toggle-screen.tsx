import { Box, Button, Container, Flex, Heading, Icon, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, NotePencil } from "@phosphor-icons/react"
import React from "react"
import { Trans, useTranslation } from "react-i18next"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { SubmissionsInboxSetupScreen } from "../../domains/home/review-manager/configuration-management-screen/submissions-inbox-setup-screen"
import { SwitchButton } from "../buttons/switch-button"
import { RouterLinkButton } from "../navigation/router-link-button"

interface FeatureToggleScreenProps {
  i18nPrefix: string
  featureKey: string
  backUrl: string
  isEnabled: boolean
  editPageUrl: string
  onToggle: (checked: boolean) => void
  pageKey: string
}

export const FeatureToggleScreen: React.FC<FeatureToggleScreenProps> = ({
  i18nPrefix,
  featureKey,
  backUrl,
  isEnabled,
  editPageUrl,
  onToggle,
  pageKey,
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
            <Trans
              i18nKey={`${i18nPrefix}.${featureKey}Description`}
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
        {/* ts-ignore */}
        <Flex w="100%" align="center" justify="space-between">
          {!location.pathname.endsWith("/submissions-inbox-setup") && pageKey !== "my-jurisdiction-about-page" ? (
            <>
              <Text color="text.secondary" fontSize="lg" fontWeight="bold">
                {t(`${i18nPrefix}.${featureKey}`)}
              </Text>
              <SwitchButton isChecked={isEnabled} onChange={(e) => onToggle(e.target.checked)} size={"lg"} mt={1} />
            </>
          ) : (
            <span />
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
      {pageKey === "my-jurisdiction-about-page" && (
        <Box>
          <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={4}>
            {t(`${i18nPrefix}.editJurisdictionAboutPage`)}
          </Heading>
          <Button
            as={RouterLink}
            to={pageKey}
            leftIcon={<Icon as={NotePencil} boxSize={6} />}
            colorScheme="blue"
            size="lg"
            fontWeight="bold"
            borderRadius="lg"
            px={8}
          >
            {t(`${i18nPrefix}.editJurisdictionEditButton`)}
          </Button>
        </Box>
      )}
    </Container>
  )
}
