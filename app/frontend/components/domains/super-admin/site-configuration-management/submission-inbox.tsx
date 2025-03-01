import { Box, Container, Divider, Flex, Heading, HStack, Switch, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, Check, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { SwitchButton } from "../../../shared/buttons/switch-button"

export const AdminSubmissionInboxScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const [inboxEnabled, setInboxEnabled] = useState(false)

  const updateInboxEnabled = async (checked) => {
    setInboxEnabled(checked)
    await updateSiteConfiguration({
      inboxEnabled: checked,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setInboxEnabled(siteConfigurationStore.inboxEnabled || false)
    }
  }, [configurationLoaded])

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
        <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Box>
            <RouterLinkButton
              variant={"link"}
              to={`/configuration-management/global-feature-access/`}
              leftIcon={<CaretLeft size={20} />}
              style={{ textDecoration: 'none' }}
            >
              {t("ui.back")}
            </RouterLinkButton>
            <Heading as="h1" marginTop={"15px"}>{t(`${i18nPrefix}.submissionInbox`)}</Heading>
            <Text color="text.secondary" my={6}>
              {t(`${i18nPrefix}.submissionInboxDescription`)}
            </Text>
          </Box>
        </Flex>
      </VStack>
      <Flex justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
        <VStack justifyContent={"space-between"} w={"full"} alignItems={"flex-end"}>
          <Flex direction="row" justify="space-between" w="100%">
            <Text style={{ fontWeight: 'bold' }}>{t(`${i18nPrefix}.submissionInbox`)}</Text>
            <HStack spacing={5} align="center">
              <HStack spacing={6}>
                <SwitchButton
                  enable={inboxEnabled}
                  update={updateInboxEnabled}
                  size={'lg'}
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
