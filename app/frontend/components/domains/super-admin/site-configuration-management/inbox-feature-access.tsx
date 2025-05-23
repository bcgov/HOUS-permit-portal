import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { SwitchButton } from "../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const InboxFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const [inboxEnabled, setInboxEnabled] = useState(false)

  const updateInboxEnabled = async (e) => {
    // optimistic update is fine
    setInboxEnabled(e.target.checked)
    await updateSiteConfiguration({
      inboxEnabled: e.target.checked,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setInboxEnabled(siteConfigurationStore.inboxEnabled || false)
    }
  }, [configurationLoaded])

  return (
    <Container maxW="container.lg" p={8} as={"main"}>
      <VStack alignItems={"flex-start"} w={"full"} h={"full"} gap={6}>
        <RouterLinkButton
          variant={"link"}
          to={`/configuration-management/global-feature-access/`}
          leftIcon={<CaretLeft size={20} />}
          textDecoration="none"
        >
          {t("ui.back")}
        </RouterLinkButton>
        <Heading as="h1" m={0}>
          {t(`${i18nPrefix}.submissionInbox`)}
        </Heading>
        <Text color="text.secondary" m={0}>
          {t(`${i18nPrefix}.submissionInboxDescription`)}
        </Text>
        <Flex pb={4} justify="space-between" w="100%" borderBottom="1px solid" borderColor="border.light">
          <Text fontWeight="bold">{t(`${i18nPrefix}.submissionInbox`)}</Text>
          <SwitchButton isChecked={inboxEnabled} onChange={updateInboxEnabled} size={"lg"} />
        </Flex>
      </VStack>
    </Container>
  )
})
