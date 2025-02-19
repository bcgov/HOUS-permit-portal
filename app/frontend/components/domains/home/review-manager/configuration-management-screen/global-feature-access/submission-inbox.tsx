import { Box, Container, Divider, Flex, Heading, HStack, Switch, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { RouterLinkButton } from "../../../../../shared/navigation/router-link-button"

export const ReviewManagerSubmissionInboxScreen = observer(() => {
  const i18nPrefix = "home.configurationManagement.globalFeatureAccess"
  const { t } = useTranslation()
  const { currentJurisdiction } = useJurisdiction()

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <RouterLinkButton
              variant={"link"}
              to={`/jurisdictions/${currentJurisdiction?.slug}/configuration-management/global-feature-access/`}
              leftIcon={<CaretLeft size={16} />}
            >
              {t("ui.back")}
            </RouterLinkButton>
            <Heading as="h1">{t(`${i18nPrefix}.submissionInbox`)}</Heading>
            <Text color="text.secondary" my={6}>
              {t(`${i18nPrefix}.submissionInboxDescription`)}
            </Text>
          </Box>
        </Flex>
      </VStack>
      <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
        <VStack justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Flex direction="row" justify="space-between" w="100%">
            <Text>{t(`${i18nPrefix}.submissionInbox`)}</Text>
            <HStack spacing={5} align="center">
              <HStack spacing={6}>
                <Switch
                  id="inbox-enabled-switch"
                  isChecked={currentJurisdiction?.inboxEnabled}
                  onChange={(e) => {
                    currentJurisdiction.update({ inboxEnabled: e.target.checked })
                  }}
                />
              </HStack>
            </HStack>
          </Flex>
          <Divider />
        </VStack>
      </Flex>
    </Container>
  )
})
