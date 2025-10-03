import {
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { CoverSheetForm } from "./cover-sheet-form"
import { InputSummaryForm } from "./input-summary-form"
import { PdfFormGridRow } from "./pdf-form-grid-row"
import { PdfFormsGridHeader } from "./pdf-forms-grid-header"
import { RoomByRoomForm } from "./room-by-room-form"

export const SingleZoneCoolingHeatingToolListScreen = observer(() => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const formMethods = useForm()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [loadingPdfs, setLoadingPdfs] = useState<Record<string, boolean>>({})
  const [generatedPdfs, setGeneratedPdfs] = useState<Record<string, string>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTabIndex, setEditTabIndex] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const {
    currentPage,
    totalPages,
    totalCount,
    countPerPage,
    setCurrentPage,
    setCountPerPage,
    isSearching,
    tablePdfForms,
    searchPdfForms,
  } = pdfFormStore

  const handleCountPerPageChange = (newCount: number) => {
    setCountPerPage(newCount)
    searchPdfForms({ countPerPage: newCount, page: 1 })
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    searchPdfForms({ page })
  }

  useEffect(() => {
    searchPdfForms()
  }, [])

  const generatePdf = async (id: string) => {
    setLoadingPdfs((prev) => ({ ...prev, [id]: true }))

    try {
      const result = await pdfFormStore.generatePdf(id)

      setTimeout(() => {
        setLoadingPdfs((prev) => ({ ...prev, [id]: false }))

        setGeneratedPdfs((prev) => ({ ...prev, [id]: "ready" }))
      }, 5000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setLoadingPdfs((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleDownloadPdf = async (id: string) => {
    try {
      const response = await pdfFormStore.environment.api.downloadPdf(id)

      if (!response.data || (response.data as Blob).size === 0) {
        alert("PDF file is empty or not ready yet. Please wait a moment and try again.")
        return
      }

      const blob = new Blob([response.data as Blob], { type: "application/pdf" })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pdf_form_${id}.pdf`

      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading PDF:", error)
      alert("Error downloading PDF. The file may not be ready yet. Please try again in a moment.")
    }
  }

  const openEdit = (id: string, currentJson: any) => {
    setEditingId(id)

    const formData = currentJson ?? {}
    const mappedFormData = {
      ...formData,
      AboveGradeWalls_styleA: formData.aboveGradeWallsStyleA || "",
      AboveGradeWalls_styleB: formData.aboveGradeWallsStyleB || "",
      AboveGradeWalls_styleC: formData.aboveGradeWallsStyleC || "",
      BelowGradeWalls_styleA: formData.belowGradeWallsStyleA || "",
      BelowGradeWalls_styleB: formData.belowGradeWallsStyleB || "",
      BelowGradeWalls_styleC: formData.belowGradeWallsStyleC || "",
      Ceilings_styleA: formData.ceilingsStyleA || "",
      Ceilings_styleB: formData.ceilingsStyleB || "",
      Ceilings_styleC: formData.ceilingsStyleC || "",
      FloorsonSoil_styleA: formData.floorsonSoilStyleA || "",
      FloorsonSoil_styleB: formData.floorsonSoilStyleB || "",
      FloorsonSoil_styleC: formData.floorsonSoilStyleC || "",
      Windows_styleA: formData.windowsStyleA || "",
      Windows_styleB: formData.windowsStyleB || "",
      Windows_styleC: formData.windowsStyleC || "",
      ExposedFloors_styleA: formData.exposedFloorsStyleA || "",
      ExposedFloors_styleB: formData.exposedFloorsStyleB || "",
      ExposedFloors_styleC: formData.exposedFloorsStyleC || "",
      Doors_styleA: formData.doorsStyleA || "",
      Doors_styleB: formData.doorsStyleB || "",
      Doors_styleC: formData.doorsStyleC || "",
      Skylights_styleA: formData.skylightsStyleA || "",
      Skylights_styleB: formData.skylightsStyleB || "",
      Skylights_styleC: formData.skylightsStyleC || "",
    }
    formMethods.reset(mappedFormData)

    setEditTabIndex(0)
    onOpen()
  }

  const saveEdit = async () => {
    if (!editingId) return
    const values = formMethods.getValues()
    const result = await pdfFormStore.updatePdfForm(editingId, { formJson: values })
    if (result.success) {
      onClose()
    } else {
      alert("Failed to update form")
    }
  }

  return (
    <Container maxW="container.xl" pb="36" px="8">
      <Heading as="h1" mt="16" mb="6">
        {t("singleZoneCoolingHeatingTool.title")}
      </Heading>
      <Button onClick={() => (window.location.href = "/single-zone-cooling-heating-tool")}>
        {t("singleZoneCoolingHeatingTool.addNewForm")}
      </Button>
      <FormProvider {...formMethods}>
        <Tabs isLazy index={activeTabIndex} onChange={setActiveTabIndex}>
          <TabList>
            <Tab>{t("singleZoneCoolingHeatingTool.list")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
                <SearchGrid templateColumns="1fr 1fr 2fr" gridRowClassName="pdf-form-grid-row">
                  <PdfFormsGridHeader />
                  {isSearching ? (
                    <Flex py="50" gridColumn={"span 3"}>
                      <SharedSpinner />
                    </Flex>
                  ) : (
                    tablePdfForms.map((pdfForm) => (
                      <PdfFormGridRow
                        key={pdfForm.id}
                        pdfForm={pdfForm}
                        onGeneratePdf={generatePdf}
                        onDownloadPdf={handleDownloadPdf}
                        isGenerating={!!loadingPdfs[pdfForm.id]}
                        isDownloaded={!!generatedPdfs[pdfForm.id]}
                      />
                    ))
                  )}
                </SearchGrid>
                <Flex w={"full"} justifyContent={"space-between"}>
                  <PerPageSelect
                    handleCountPerPageChange={handleCountPerPageChange}
                    countPerPage={countPerPage}
                    totalCount={totalCount}
                  />
                  <Paginator
                    current={currentPage}
                    total={totalCount}
                    totalPages={totalPages}
                    pageSize={countPerPage}
                    handlePageChange={handlePageChange}
                    showLessItems={true}
                  />
                </Flex>
              </VStack>
              <Modal isOpen={isOpen} onClose={onClose} size="6xl">
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>{t("ui.update")}</ModalHeader>
                  <ModalBody>
                    <FormProvider {...formMethods}>
                      <Tabs isLazy index={editTabIndex} onChange={setEditTabIndex}>
                        <TabList>
                          <Tab>{t("singleZoneCoolingHeatingTool.tabs.compliance")}</Tab>
                          <Tab>{t("singleZoneCoolingHeatingTool.tabs.inputSummary")}</Tab>
                          <Tab>{t("singleZoneCoolingHeatingTool.tabs.roomByRoom")}</Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <CoverSheetForm onNext={() => setEditTabIndex(1)} />
                          </TabPanel>
                          <TabPanel>
                            <InputSummaryForm onNext={() => setEditTabIndex(1)} />
                          </TabPanel>
                          <TabPanel>
                            <RoomByRoomForm onSubmit={saveEdit} />
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </FormProvider>
                  </ModalBody>
                  <ModalFooter>
                    <HStack spacing={3}>
                      <Button onClick={onClose}>{t("ui.cancel")}</Button>
                      <Button variant="primary" onClick={saveEdit}>
                        {t("ui.save")}
                      </Button>
                    </HStack>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </FormProvider>
    </Container>
  )
})
