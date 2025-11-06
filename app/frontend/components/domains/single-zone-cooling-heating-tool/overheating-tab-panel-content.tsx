import { Box, Container, Divider, Flex, FormControl, GridItem, Heading, Select, Text, VStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
//import { StepCodeTypeFilter } from "./step-code-type-filter"
import { EFlashMessageStatus, EPdfFormSortFields } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { Paginator } from "../../shared/base/inputs/paginator"
import { PerPageSelect } from "../../shared/base/inputs/per-page-select"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { SearchGrid } from "../../shared/grid/search-grid"
import { PdfFormGridRow } from "../single-zone-cooling-heating-tool/pdf-form-grid-row"
import { GridHeaders, OVERHEATING_GRID_TEMPLATE_COLUMNS } from "./grid-header"

export const OverheatingTabPanelContent = observer(() => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const [loadingPdfs, setLoadingPdfs] = useState<Record<string, boolean>>({})
  const [generatedPdfs, setGeneratedPdfs] = useState<Record<string, string>>({})
  const { isSearching, tablePdfForms, searchPdfForms, countPerPage, totalCount, currentPage, totalPages } = pdfFormStore

  useEffect(() => {
    // Initial load: page 1, 10 per page
    searchPdfForms({ page: 1, countPerPage: 10 })
  }, [])

  const generatePdf = async (id: string) => {
    setLoadingPdfs((prev) => ({ ...prev, [id]: true }))

    try {
      const result = await pdfFormStore.generatePdf(id)

      setTimeout(() => {
        setLoadingPdfs((prev) => ({ ...prev, [id]: false }))

        setGeneratedPdfs((prev) => ({ ...prev, [id]: "ready" }))
      }, 4000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setLoadingPdfs((prev) => ({ ...prev, [id]: false }))
    }
  }

  const archivePdf = async (id: string) => {
    await pdfFormStore.archivePdfForm(id)
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

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>{t("singleZoneCoolingHeatingTool.indexTitle")}</Heading>
          </Flex>
          <Box w="full" bg="theme.blueLight" p={6} borderRadius="md">
            <Box maxW="xl">
              <Heading as="h3" mb={6}>
                {t("singleZoneCoolingHeatingTool.createReportTitle")}
              </Heading>
              <Text mb={3}>
                {t("singleZoneCoolingHeatingTool.createReportDescriptionPrefix")}{" "}
                {t("singleZoneCoolingHeatingTool.createReportDescriptionLink")}
              </Text>
              <RouterLinkButton rightIcon={<CaretRight />} to="/single-zone-cooling-heating-tool/start">
                {t("stepCode.createButton")}
              </RouterLinkButton>
              <Divider borderColor="greys.grey03" my={4} />
            </Box>
          </Box>
          <Flex direction="column" gap={4} w="full">
            <Heading as="h3" mb={5} mt={4}>
              {t("singleZoneCoolingHeatingTool.pickUpWhereYouLeftOff")}
            </Heading>
            <Flex gap={4} w="full" align="center">
              <FormControl w="full">
                <ModelSearchInput
                  searchModel={pdfFormStore as any}
                  inputProps={{ placeholder: t("ui.search"), width: "full" }}
                  inputGroupProps={{ width: "full" }}
                />
              </FormControl>
              <FormControl maxW="240px">
                <Select
                  value={pdfFormStore.statusFilter}
                  onChange={(e) => pdfFormStore.setStatusFilter(e.target.value as any)}
                >
                  <option value="unarchived">{(t as any)("ui.unarchived") || "Unarchived"}</option>
                  <option value="archived">{(t as any)("ui.archived") || "Archived"}</option>
                  <option value="all">{(t as any)("ui.all") || "All"}</option>
                </Select>
              </FormControl>
            </Flex>
          </Flex>
          <SearchGrid templateColumns={OVERHEATING_GRID_TEMPLATE_COLUMNS} gridRowClassName="project-grid-row">
            <GridHeaders columns={Object.values(EPdfFormSortFields)} includeActionColumn />

            {isSearching ? (
              <Flex gridColumn="span 6" justify="center" align="center" minH="200px">
                <SharedSpinner />
              </Flex>
            ) : R.isEmpty(tablePdfForms) ? (
              <GridItem gridColumn="span 6">
                <CustomMessageBox
                  m={4}
                  status={EFlashMessageStatus.info}
                  description={t("permitProject.noneFoundExplanation")}
                />
              </GridItem>
            ) : (
              tablePdfForms.map((pdfForm) => (
                <PdfFormGridRow
                  onGeneratePdf={generatePdf}
                  onArchivePdf={archivePdf}
                  onDownloadPdf={handleDownloadPdf}
                  isGenerating={false}
                  isDownloaded={false}
                  key={pdfForm.id}
                  pdfForm={pdfForm}
                />
              ))
            )}
          </SearchGrid>
          <Flex w={"full"} justifyContent={"space-between"}>
            <PerPageSelect
              handleCountPerPageChange={(pdfFormStore as any).handleCountPerPageChange}
              countPerPage={countPerPage}
              totalCount={totalCount}
            />
            <Paginator
              current={currentPage}
              total={totalCount}
              totalPages={totalPages}
              pageSize={countPerPage}
              handlePageChange={(pdfFormStore as any).handlePageChange}
              showLessItems={true}
            />
          </Flex>
        </VStack>
      </Container>
    </Flex>
  )
})
