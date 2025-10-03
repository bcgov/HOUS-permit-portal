import { Box, Container, Flex, Heading, useDisclosure, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"

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
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>{t("stepCode.index.title")}</Heading>
          </Flex>
          <Box w="full" bg="theme.blueLight" p={6} borderRadius="md">
            <Box maxW="xl">
              <Heading as="h3" mb={6}>
                {t("stepCode.index.createReportTitle")}
              </Heading>

              <Heading as="h3" mt={2} mb={1}>
                {t("stepCode.index.lookupTitle")}
              </Heading>
            </Box>
          </Box>
          <Flex direction="column" gap={4} w="full"></Flex>
        </VStack>
      </Container>
    </Flex>
  )
})
