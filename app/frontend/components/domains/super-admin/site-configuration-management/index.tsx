import { Container, Grid, GridItem, Heading, VStack } from "@chakra-ui/react"
import { FlagBanner, Question, Users } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { HomeScreenBox } from "../../home/home-screen-box"

export const SiteConfigurationManagementScreen = observer(function SiteConfigurationManagementScreen() {
  const i18nPrefix = "siteConfiguration"

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      <VStack spacing={8} align="start">
        <Heading mb={0} fontSize="3xl">
          {t(`${i18nPrefix}.title`)}
        </Heading>

        <Grid templateColumns="repeat(2, 1fr)" gap={6}>
          <GridItem>
            <HomeScreenBox
              title={t(`${i18nPrefix}.sitewideMessage.title`)}
              description={t(`${i18nPrefix}.sitewideMessage.description`)}
              linkText={t("ui.edit")}
              icon={<FlagBanner size="24px" color="--var(chakra-colors-text-primary)" />}
              href="sitewide-message"
              h="full"
            />
          </GridItem>
          <GridItem>
            <HomeScreenBox
              title={t(`${i18nPrefix}.adminUserIndex.title`)}
              description={t(`${i18nPrefix}.adminUserIndex.description`)}
              linkText={t("ui.edit")}
              icon={<Users size="24px" color="--var(chakra-colors-text-primary)" />}
              href="users"
              h="full"
            />
          </GridItem>
          <GridItem>
            <HomeScreenBox
              title={t(`${i18nPrefix}.helpDrawerSetup.title`)}
              description={t(`${i18nPrefix}.helpDrawerSetup.description`)}
              linkText={t("ui.edit")}
              icon={<Question size="24px" color="--var(chakra-colors-text-primary)" />}
              href="help-drawer-setup"
              h="full"
            />
          </GridItem>
        </Grid>
      </VStack>
    </Container>
  )
})
