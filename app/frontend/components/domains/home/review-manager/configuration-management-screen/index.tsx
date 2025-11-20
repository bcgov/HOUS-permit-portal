import { Container, Flex, FormControl, FormLabel, Grid, GridItem, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { FileText, Info, Key, Paperclip, SlidersHorizontal, Users } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../../../setup/root"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { HomeScreenBox } from "../../home-screen-box"
import { SectionBox } from "../../section-box"

export const ConfigurationManagementScreen = observer(function ConfigurationManagementScreen() {
  const i18nPrefix = "home.configurationManagement"
  const { currentJurisdiction, error } = useJurisdiction()
  const { userStore } = useMst()
  const { currentUser } = userStore
  const isTechnicalSupport = currentUser?.isTechnicalSupport
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
            {/* Refactored grid items to avoid duplication */}
            {(() => {
              const apiKeysGridItem = (
                <GridItem key="apiKeys">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.externalApiKeys.title`)}
                    description={t(`${i18nPrefix}.externalApiKeys.description`)}
                    linkText={t("ui.edit")}
                    icon={<Key size={24} />}
                    href={`/jurisdictions/${currentJurisdiction.slug}/api-settings`}
                    h="full"
                  />
                </GridItem>
              )
              const usersGridItem = (
                <GridItem key="users">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.users.title`)}
                    description={t(`${i18nPrefix}.users.description`)}
                    linkText={t("ui.edit")}
                    icon={<Users size={24} />}
                    href={`/jurisdictions/${currentJurisdiction.slug}/users`}
                    h="full"
                    disableForSandbox
                  />
                </GridItem>
              )
              const stepCodeGridItem = (
                <GridItem key="stepCode">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.stepCodeRequirements.title`)}
                    description={t(`${i18nPrefix}.stepCodeRequirements.description`)}
                    linkText={t("ui.edit")}
                    icon={<FileText size="24px" color="var(--chakra-colors-text-primary)" />}
                    href="energy-step"
                    h="full"
                    disableForSandbox
                  />
                </GridItem>
              )
              const featureAccessGridItem = (
                <GridItem key="featureAccess">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.featureAccess.title`)}
                    description={t(`${i18nPrefix}.featureAccess.description`)}
                    linkText={t("ui.edit")}
                    icon={<SlidersHorizontal size="24px" color="var(--chakra-colors-text-link)" />}
                    href="feature-access"
                    h="full"
                  />
                </GridItem>
              )
              const resourcesGridItem = (
                <GridItem key="resources">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.resources.title`)}
                    description={t(`${i18nPrefix}.resources.shortDescription`)}
                    linkText={t("ui.edit")}
                    icon={<Paperclip size={24} />}
                    href="resources"
                    h="full"
                  />
                </GridItem>
              )
              const myJurisdictionAboutPageGridItem = (
                <GridItem key="myJurisdictionAboutPage">
                  <HomeScreenBox
                    title={t(`${i18nPrefix}.myJurisdictionAboutPage.title`)}
                    description={t(`${i18nPrefix}.myJurisdictionAboutPage.description`)}
                    linkText={t("ui.edit")}
                    icon={<Info size={24} />}
                    href={`/jurisdictions/${currentJurisdiction.slug}`}
                    h="full"
                  />
                </GridItem>
              )
              const items = isTechnicalSupport
                ? [apiKeysGridItem, usersGridItem]
                : [
                    myJurisdictionAboutPageGridItem,
                    stepCodeGridItem,
                    apiKeysGridItem,
                    usersGridItem,
                    featureAccessGridItem,
                    resourcesGridItem,
                  ]
              return (
                <Grid templateColumns="repeat(2, 1fr)" gap={6}>
                  {items}
                </Grid>
              )
            })()}
          </VStack>
        </Container>
      )}
    </Suspense>
  )
})
