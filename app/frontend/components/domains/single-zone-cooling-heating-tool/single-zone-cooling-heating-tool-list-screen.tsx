import {
  Button,
  Container,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Tab,
  Table,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { CoverSheetForm } from "./cover-sheet-form"
import { InputSummaryForm } from "./input-summary-form"

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

  useEffect(() => {
    pdfFormStore.getPdfForms()
  }, [])

  const pdfForms = pdfFormStore.pdfForms

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
    // Prefill form values
    formMethods.reset(currentJson ?? {})
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
      <Button onClick={() => (window.location.href = "/single-zone-cooling-heating-tool")}>Back</Button>
      <FormProvider {...formMethods}>
        <Tabs isLazy index={activeTabIndex} onChange={setActiveTabIndex}>
          <TabList>
            <Tab>{t("singleZoneCoolingHeatingTool.list")}</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Table>
                <Thead>
                  <Tr>
                    <Th>{t("singleZoneCoolingHeatingTool.formType")}</Th>
                    <Th>{t("singleZoneCoolingHeatingTool.status")}</Th>
                    <Th>{t("singleZoneCoolingHeatingTool.createdAt")}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {pdfForms.map((pdfForm) => (
                    <Tr key={pdfForm.id}>
                      <Td>
                        {pdfForm.formType} | {pdfForm.id}
                      </Td>
                      <Td>{pdfForm.status ? "Active" : "Inactive"}</Td>
                      <Td>{pdfForm.createdAt?.toLocaleDateString()}</Td>
                      <Td>
                        <HStack spacing={3}>
                          <Button
                            onClick={() => generatePdf(pdfForm.id)}
                            isDisabled={loadingPdfs[pdfForm.id] || !!generatedPdfs[pdfForm.id]}
                          >
                            {t("singleZoneCoolingHeatingTool.generatePdf")}
                          </Button>
                          {loadingPdfs[pdfForm.id] && <Spinner size="sm" color="blue.500" />}
                          {generatedPdfs[pdfForm.id] && (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleDownloadPdf(pdfForm.id)}
                            >
                              Download PDF
                            </Button>
                          )}
                        </HStack>
                      </Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(pdfForm.id, (pdfForm as any).formJson)}
                        >
                          {t("ui.update")}
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
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
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <CoverSheetForm onNext={() => setEditTabIndex(1)} />
                          </TabPanel>
                          <TabPanel>
                            <InputSummaryForm onSubmit={saveEdit} />
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </FormProvider>
                  </ModalBody>
                  <ModalFooter>
                    <HStack spacing={3}>
                      <Button onClick={onClose}>{t("ui.cancel")}</Button>
                      <Button colorScheme="blue" onClick={saveEdit}>
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
