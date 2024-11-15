import { Container, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { FileText, Info, SlidersHorizontal, Tray } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { HomeScreenBox } from "../../home-screen-box"
import { SectionBox } from "../../section-box"

export const ConfigurationManagementScreen = observer(function ConfigurationManagementScreen() {
  const i18nPrefix = "home.configurationManagement"
  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen error={error} />
  ) : (
    <Suspense fallback={<LoadingScreen />}>
      {currentJurisdiction && (
        <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
          <VStack spacing={8} align="start">
            <Heading mb={0} fontSize="3xl">
              {t(`${i18nPrefix}.title`)}
            </Heading>

            <SectionBox>
              <Flex align="flex-end">
                <Text mb={2} mr={2}>
                  The
                </Text>
                <FormControl>
                  <FormLabel>{t(`${i18nPrefix}.jurisdictionLocalityTypeLabel`)}</FormLabel>
                  <Input
                    bg="greys.white"
                    value={currentJurisdiction.localityType}
                    isDisabled
                    textTransform={"capitalize"}
                  />
                </FormControl>
                <Text mb={2} mx={2}>
                  of
                </Text>
                <FormControl>
                  <FormLabel>{t(`${i18nPrefix}.jurisdictionNameLabel`)}</FormLabel>
                  <Input bg="greys.white" value={currentJurisdiction.name} isDisabled />
                </FormControl>
                {/* TODO: what to show here? */}
                {/* <FormControl>
              <FormLabel>{t(`${i18nPrefix}.jurisdictionLocationLabel`)}</FormLabel>
              <Input bg="greys.white" value={jurisdiction.boundryPoints} isDisabled />
            </FormControl> */}
              </Flex>
            </SectionBox>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              <GridItem>
                <HomeScreenBox
                  title={t(`${i18nPrefix}.submissionsInboxSetup.title`)}
                  description={t(`${i18nPrefix}.submissionsInboxSetup.description`)}
                  linkText={t("ui.edit")}
                  icon={<Tray size="24px" color="var(--chakra-colors-text-primary)" />}
                  href="submissions-inbox-setup"
                  h="full"
                  disableForSandbox
                />
              </GridItem>
              <GridItem>
                <HomeScreenBox
                  title={t(`${i18nPrefix}.stepCodeRequirements.title`)}
                  description={t(`${i18nPrefix}.stepCodeRequirements.description`)}
                  linkText={t("ui.edit")}
                  icon={<FileText size="24px" color="var(--chakra-colors-text-primary)" />}
                  href="energy-step"
                  h="full"
                  markForSandbox
                />
              </GridItem>
              <GridItem>
                <HomeScreenBox
                  title={t(`${i18nPrefix}.jurisdictionAbout.title`)}
                  description={t(`${i18nPrefix}.jurisdictionAbout.description`)}
                  linkText={t("ui.edit")}
                  icon={<Info size="24px" color="var(--chakra-colors-text-primary)" />}
                  href={`/jurisdictions/${currentJurisdiction.slug}`}
                  h="full"
                  disableForSandbox
                />
              </GridItem>
              <GridItem>
                <HomeScreenBox
                  title={t(`${i18nPrefix}.externalApiKeys.title`)}
                  description={t(`${i18nPrefix}.externalApiKeys.description`)}
                  linkText={t("ui.edit")}
                  icon={<SlidersHorizontal size={24} />}
                  href={`/jurisdictions/${currentJurisdiction.slug}/api-settings`}
                  h="full"
                  markForSandbox
                />
              </GridItem>
            </Grid>
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
