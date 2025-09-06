import { Button, Container, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, useToast } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { CoverSheetForm } from "./cover-sheet-form"
import { InputSummaryForm } from "./input-summary-form"
import { RoomByRoomForm } from "./room-by-room-form"

export const SingleZoneCoolingHeatingToolScreen = observer(() => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const toast = useToast()
  const formMethods = useForm()

  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const handleNextFromCoverSheet = () => {
    setActiveTabIndex(1)
  }

  const handleNextRoomByRoom = () => {
    setActiveTabIndex(2)
  }

  const handleSubmit = async () => {
    const formData = formMethods.getValues()

    const result = await pdfFormStore.createPdfForm({
      formJson: formData,
      formType: "single_zone_cooling_heating_tool",
      status: true,
    })
    if (result.success) {
      toast({
        title: "Success",
        description: "Form data saved successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
      window.location.href = "/single-zone-cooling-heating-tool/list"
    } else {
      toast({
        title: "Error",
        description: "Failed to save form data. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  return (
    <Container maxW="container.xl" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("singleZoneCoolingHeatingTool.title")}
      </Heading>
      <Button onClick={() => (window.location.href = "/single-zone-cooling-heating-tool/list")}>View List</Button>
      <FormProvider {...formMethods}>
        <Tabs isLazy index={activeTabIndex} onChange={setActiveTabIndex}>
          <TabList>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.compliance")}</Tab>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.inputSummary")}</Tab>
            <Tab>{t("singleZoneCoolingHeatingTool.tabs.roomByRoom")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CoverSheetForm onNext={handleNextFromCoverSheet} />
            </TabPanel>
            <TabPanel>
              <InputSummaryForm onNext={handleNextRoomByRoom} />
            </TabPanel>
            <TabPanel>
              <RoomByRoomForm onSubmit={handleSubmit} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormProvider>
    </Container>
  )
})
