import { Container, Flex, Heading, Text, VStack } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { SwitchButton } from "../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const AdminDesignatedReviewerScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const [allowDesignatedReviewer, setAllowDesignatedReviewer] = useState(false)

  const updateInboxEnabled = async (e) => {
    // optimistic update is fine
    setAllowDesignatedReviewer(e.target.checked)
    await updateSiteConfiguration({
      allowDesignatedReviewer: e.target.checked,
    })
  }

  useEffect(() => {
    if (configurationLoaded) {
      setAllowDesignatedReviewer(siteConfigurationStore.allowDesignatedReviewer || false)
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
        <Heading as="h1" m={0} p={0}>
          {t(`${i18nPrefix}.designatedReviewer`)}
        </Heading>
        <Flex pb={4} justify="space-between" w="100%" borderBottom="1px solid" borderColor="border.light">
          <Text>{t(`${i18nPrefix}.designatedReviewerDescription`)}</Text>
          <SwitchButton isChecked={allowDesignatedReviewer} onChange={updateInboxEnabled} size={"lg"} />
        </Flex>
      </VStack>
    </Container>
  )
})
