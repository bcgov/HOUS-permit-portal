import { Flex, FormControl, FormLabel, Input, Text } from "@chakra-ui/react"
import { SlidersHorizontal, Users } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { SectionBox } from "../../section-box"
import { TechnicalSupportHomeSection } from "../TechnicalSupportHomeSection"

export const TechnicalSupportConfigurationManagementScreen = observer(function ConfigurationManagementScreen() {
  const i18nPrefix = "home.configurationManagement"
  const { currentJurisdiction, error } = useJurisdiction()

  if (error) return <ErrorScreen error={error} />

  if (!currentJurisdiction) return <LoadingScreen />

  const boxes = [
    {
      title: t(`${i18nPrefix}.externalApiKeys.title`),
      description: t(`${i18nPrefix}.externalApiKeys.description`),
      linkText: t("ui.edit"),
      icon: <SlidersHorizontal size={24} />,
      href: `/jurisdictions/${currentJurisdiction.slug}/api-settings`,
      h: "full",
    },
    {
      title: t(`${i18nPrefix}.users.title`),
      description: t(`${i18nPrefix}.users.description`),
      linkText: t("ui.edit"),
      icon: <Users size={24} />,
      href: `/jurisdictions/${currentJurisdiction.slug}/users`,
      h: "full",
      disableForSandbox: true,
    },
  ]

  return (
    <Suspense fallback={<LoadingScreen />}>
      <TechnicalSupportHomeSection
        heading={t(`${i18nPrefix}.title`)}
        boxes={boxes}
        containerProps={{ maxW: "container.lg", py: 8, px: { base: 8, xl: 0 }, flexGrow: 1 }}
        flexProps={{ align: "start" }}
      >
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
          </Flex>
        </SectionBox>
      </TechnicalSupportHomeSection>
    </Suspense>
  )
})
