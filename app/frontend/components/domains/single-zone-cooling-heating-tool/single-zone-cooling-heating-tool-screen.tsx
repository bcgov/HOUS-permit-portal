import { Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { CoverSheetForm } from "./cover-sheet-form"
import { InputSummaryForm } from "./input-summary-form"
import { ResultsForm } from "./results-form"

export const SingleZoneCoolingHeatingToolScreen = observer(() => {
  const { t } = useTranslation()
  const formMethods = useForm()

  return (
    <Container maxW="container.xl" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("singleZoneCoolingHeatingTool.title")}
      </Heading>
      <FormProvider {...formMethods}>
        <Tabs isLazy>
          <TabList>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.compliance")}</Tab>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.inputSummary")}</Tab>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.results")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CoverSheetForm />
            </TabPanel>
            <TabPanel>
              <InputSummaryForm />
            </TabPanel>
            <TabPanel>
              <ResultsForm />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormProvider>
    </Container>
  )
})
