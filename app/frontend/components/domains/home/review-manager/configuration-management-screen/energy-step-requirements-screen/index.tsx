import { Container, Heading, Link, Tab, TabList, TabPanel, TabPanels, Tabs, Text, VStack } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useJurisdiction } from "../../../../../../hooks/resources/use-jurisdiction"
import { usePermitClassificationsLoad } from "../../../../../../hooks/resources/use-permit-classifications-load"
import { useMst } from "../../../../../../setup/root"
import { ErrorScreen } from "../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../shared/base/loading-screen"
import { Part9EnergyStepEditableBlock } from "./energy-step-editable-block/part-9-energy-step-editable-block"
import { i18nPrefix } from "./i18n-prefix"
import { Part3HeatingDegreeDaysForm } from "./part-3-heating-degree-days-form"

export const EnergyStepRequirementsScreen = observer(function EnergyStepRequirementsScreen() {
  const {
    stepCodeStore: { isOptionsLoaded, fetchPart9SelectOptions },
    permitClassificationStore: { part9BuildingPermitType },
  } = useMst()

  const { isLoaded: isClassificationsLoaded } = usePermitClassificationsLoad()

  useEffect(() => {
    const fetch = async () => await fetchPart9SelectOptions()
    !isOptionsLoaded && fetch()
  }, [isOptionsLoaded])

  const { currentJurisdiction, error } = useJurisdiction()

  if (!isOptionsLoaded || !part9BuildingPermitType) return <LoadingScreen />
  if (error) return <ErrorScreen error={error} />

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1}>
      {currentJurisdiction && isOptionsLoaded && isClassificationsLoaded && (
        <VStack spacing={2} align="start" w="full">
          <Heading mb={0} fontSize="3xl">
            {t(`${i18nPrefix}.title`)}
          </Heading>
          <Text fontSize="sm" color="text.secondary">
            {t(`${i18nPrefix}.description`)}
          </Text>
          <Tabs w="full" isLazy>
            <TabList>
              <Tab>{t(`${i18nPrefix}.part9Tab`)}</Tab>
              <Tab>{t(`${i18nPrefix}.part3Tab`)}</Tab>
            </TabList>
            <TabPanels>
              <TabPanel px={0}>
                <VStack spacing={8} align="start" w="full">
                  <Text fontWeight="bold">
                    {t(`${i18nPrefix}.setMinimum`)} <br />{" "}
                    <Link href={t("stepCode.helpLink")} isExternal fontWeight="normal">
                      {t("stepCode.helpLinkText")}
                      <ArrowSquareOut />
                    </Link>
                  </Text>
                  <Part9EnergyStepEditableBlock
                    key={part9BuildingPermitType.id}
                    heading={part9BuildingPermitType.name}
                    permitTypeId={part9BuildingPermitType.id}
                    jurisdiction={currentJurisdiction}
                  />
                </VStack>
              </TabPanel>
              <TabPanel px={0}>
                <VStack spacing={8} align="start" w="full">
                  <Text fontWeight="bold">
                    {t(`${i18nPrefix}.part3SetMinimum`)} <br />{" "}
                  </Text>
                  <Part3HeatingDegreeDaysForm jurisdiction={currentJurisdiction} />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      )}
    </Container>
  )
})
