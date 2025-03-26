import { Box, Container, Divider, Grid, GridItem, Heading, Text } from "@chakra-ui/react"
import { ArrowRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

export const AdminGlobalFeatureAccessScreen = observer(() => {
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  return (
    <Container maxW="container.lg" p={8} as={"main"} py={8} flexGrow={1}>
      <Box w="full">
        <Heading as="h1" pt={3}>
          {t(`${i18nPrefix}.title`)}
        </Heading>
        <Text color="text.secondary" my={6}>
          {t(`${i18nPrefix}.description`)}
        </Text>
      </Box>
      <Grid templateColumns="90% 10%" gap={4} w="full">
        <FeatureRow
          label={t(`${i18nPrefix}.submissionInbox`)}
          enabled={siteConfigurationStore?.inboxEnabled}
          route="submission-inbox"
        />
        {/* Add more FeatureRow components here */}
      </Grid>
    </Container>
  )
})

// Feature row component for reuse
const FeatureRow = ({ label, enabled, route }: { label: string; enabled?: boolean; route: string }) => {
  const { t } = useTranslation()
  const i18nPrefix = "siteConfiguration.globalFeatureAccess"

  return (
    <>
      <GridItem>
        <Text>{label}</Text>
      </GridItem>
      <GridItem display="flex" justifyContent="flex-end">
        <RouterLinkButton
          display="flex"
          justifyContent="space-between"
          rightIcon={<ArrowRight size={20} />}
          to={route}
          variant="tertiary"
          w={28}
        >
          {enabled ? t(`${i18nPrefix}.toggleOn`) : t(`${i18nPrefix}.toggleOff`)}
        </RouterLinkButton>
      </GridItem>
      <GridItem colSpan={2}>
        <Divider />
      </GridItem>
    </>
  )
}
