import { Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { CoverSheetForm } from "./cover-sheet-form"
import { InputSummaryForm } from "./input-summary-form"
import { ResultsForm } from "./results-form"

export const SingleZoneCoolingHeatingToolScreen = observer(() => {
  const { t } = useTranslation()
  const formMethods = useForm()
  const [showResults, setShowResults] = useState(false)

  const handleCalculate = () => {
    setShowResults(true)
  }

  if (showResults) {
    return (
      <Container maxW="container.xl" pb="36" px="8">
        <FormProvider {...formMethods}>
          <ResultsForm />
        </FormProvider>
      </Container>
    )
  }

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
          </TabList>
          <TabPanels>
            <TabPanel>
              <CoverSheetForm />
            </TabPanel>
            <TabPanel>
              <InputSummaryForm onCalculate={handleCalculate} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormProvider>
    </Container>
  )
})
