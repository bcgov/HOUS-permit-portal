import { Box, Button, Flex, Grid, GridItem, Heading, Icon, ListItem, OrderedList, Text } from "@chakra-ui/react"
import { ArrowsClockwise, Hourglass } from "@phosphor-icons/react"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IPdfForm } from "../../../../models/pdf-form"
import { useMst } from "../../../../setup/root"
import { EFileUploadAttachmentType } from "../../../../types/enums"
import { IBaseFileAttachment } from "../../../../types/types"
import { FileDownloadButton } from "../../../shared/base/file-download-button"

interface IReportReadyPanelProps {
  onExplore: () => void
  downloadDocument?: IBaseFileAttachment | null
  pdfForm?: IPdfForm
}

const ReportReadyPanel: React.FC<IReportReadyPanelProps> = ({ onExplore, downloadDocument, pdfForm }) => {
  const { t } = useTranslation() as any
  const { getValues } = useFormContext()
  const values = getValues() || {}
  const formJson = pdfForm?.formJson || values

  const addressLines = useMemo(() => {
    const a = formJson?.buildingLocation?.address
    const city = formJson?.buildingLocation?.city
    const prov = formJson?.buildingLocation?.province
    const postal = formJson?.buildingLocation?.postalCode
    return {
      line1: [a, city, prov].filter(Boolean).join(", "),
      line2: postal || "—",
    }
  }, [formJson])

  const uploadedDocument = useMemo(() => {
    return (
      pdfForm?.overheatingDocuments?.find((doc) => !doc._destroy) ||
      values?.overheatingDocumentsAttributes?.find((doc) => !doc._destroy)
    )
  }, [pdfForm, values])

  const uploadedName = useMemo(() => {
    return uploadedDocument?.file?.metadata?.filename || "—"
  }, [uploadedDocument])

  return (
    <Box as="form">
      <Heading as="h2" size="xl" mb={6}>
        {t("singleZoneCoolingHeatingTool.ready.title")}
      </Heading>

      <Heading as="h3" size="md" mb={4}>
        {t("singleZoneCoolingHeatingTool.ready.projectDetails")}
      </Heading>
      <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={8} mb={8}>
        <Box>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.projectNumber")}
          </Text>
          <Text>{formJson?.projectNumber || "—"}</Text>
        </Box>
        <GridItem colSpan={2}>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.address")}
          </Text>
          <Text>{addressLines.line1 || "—"}</Text>
          <Text>{addressLines.line2 || "—"}</Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.jurisdiction")}
          </Text>
          <Text>{formJson?.buildingLocation?.city || "—"}</Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.uploadedFiles")}
          </Text>
          {uploadedDocument?.id && uploadedDocument.file?.metadata?.filename ? (
            <FileDownloadButton
              document={uploadedDocument}
              modelType={EFileUploadAttachmentType.OverheatingDocument}
              variant="link"
              size="sm"
            >
              {t("singleZoneCoolingHeatingTool.ready.downloadPdf")}
            </FileDownloadButton>
          ) : (
            <Text>{uploadedName}</Text>
          )}
        </GridItem>
      </Grid>

      <Heading as="h3" size="md" mb={3}>
        {t("singleZoneCoolingHeatingTool.ready.whatNow")}
      </Heading>
      <Text color="gray.700" mb={6}>
        {t("singleZoneCoolingHeatingTool.ready.subtitle")}
      </Text>

      <Flex gap={4} align="center" mb={4}>
        <Button variant="primary" onClick={onExplore}>
          {t("singleZoneCoolingHeatingTool.ready.explore")}
        </Button>
      </Flex>
      <Text fontSize="sm">
        {t("singleZoneCoolingHeatingTool.ready.preferDownload")}{" "}
        {downloadDocument && formJson?.projectNumber && (
          <FileDownloadButton
            document={downloadDocument}
            modelType={EFileUploadAttachmentType.PdfForm}
            variant="link"
            size="sm"
          >
            {t("singleZoneCoolingHeatingTool.ready.downloadPdf")}
          </FileDownloadButton>
        )}
      </Text>
    </Box>
  )
}

export const ResultForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const [ready, setReady] = useState(false)
  const pdfForm = useMemo<IPdfForm | undefined>(() => {
    return (pdfFormStore.lastCreatedForm as IPdfForm) || pdfFormStore.pdfForms?.[0]
  }, [pdfFormStore.lastCreatedForm, pdfFormStore.pdfForms])
  const [downloadDocument, setDownloadDocument] = useState<IBaseFileAttachment | null>(null)
  const lastRequestedPdfIdRef = useRef<string | null>(null)

  useEffect(() => {
    let active = true

    const buildDocument = (form: IPdfForm): IBaseFileAttachment => {
      const fileData =
        form.pdfFileData ??
        ({
          id: form.id,
          metadata: {
            filename: `pdf_form_${form.id}.pdf`,
            size: 0,
            mimeType: "application/pdf",
          },
        } as any)
      return {
        id: form.id,
        file: fileData,
        createdAt: form.createdAt ?? new Date(),
      }
    }

    const prepareDownloadDocument = async () => {
      if (!pdfForm) {
        if (active) setDownloadDocument(null)
        lastRequestedPdfIdRef.current = null
        return
      }

      const id = pdfForm.id
      if (!pdfForm.pdfFileData && lastRequestedPdfIdRef.current !== id) {
        lastRequestedPdfIdRef.current = id
        try {
          const response = await pdfFormStore.generatePdf(id)
          if (response.success && response.data?.data) {
            pdfFormStore.setPdfForm(response.data.data)
          }
        } catch (error) {
          console.error("Failed to generate PDF", error)
        }
      }

      if (!active) return

      const latestForm = pdfFormStore.pdfForms.find((form) => form.id === id) ?? pdfForm
      if (!latestForm) {
        if (active) setDownloadDocument(null)
        return
      }

      if (active) {
        setDownloadDocument(buildDocument(latestForm))
      }
    }

    void prepareDownloadDocument()

    return () => {
      active = false
    }
  }, [pdfForm, pdfFormStore])
  const handleRefresh = async () => {
    try {
      await pdfFormStore.searchPdfForms({ page: 1, countPerPage: pdfFormStore.countPerPage })
      setReady(true)
    } catch (e) {}
  }
  const navigate = useNavigate()
  const handleExplore = () => {
    navigate("/overheating")
  }
  return (
    <Box>
      {!ready ? (
        <Box bg="theme.blueLight" p={8} borderRadius="lg">
          <Flex align="center" gap={3} mb={4}>
            <Icon as={Hourglass} boxSize={7} color="theme.blueAlt" />
            <Heading as="h2" size="lg" lineHeight="shorter" color="theme.blueAlt" m={0}>
              {t("singleZoneCoolingHeatingTool.result.preparingTitle")}
            </Heading>
          </Flex>
          <Text fontSize="lg" color="theme.blueAlt" mb={6}>
            {t("singleZoneCoolingHeatingTool.result.preparingSubtitle")}
          </Text>

          <Heading as="h3" size="md" mb={3} color="theme.blueAlt">
            {t("singleZoneCoolingHeatingTool.result.whatHappensNext")}
          </Heading>
          <OrderedList spacing={3} pl={6} mb={6} color="theme.blueAlt">
            <ListItem>{t("singleZoneCoolingHeatingTool.result.stepAnalyze")}</ListItem>
            <ListItem>{t("singleZoneCoolingHeatingTool.result.stepGenerate")}</ListItem>
            <ListItem>{t("singleZoneCoolingHeatingTool.result.stepAvailable")}</ListItem>
          </OrderedList>

          <Text color="theme.blueAlt" mb={6}>
            {t("singleZoneCoolingHeatingTool.result.noNeedToStay")}
          </Text>

          <Button leftIcon={<Icon as={ArrowsClockwise} />} onClick={handleRefresh} variant="secondary">
            {t("singleZoneCoolingHeatingTool.result.refreshStatus")}
          </Button>
        </Box>
      ) : (
        <ReportReadyPanel onExplore={handleExplore} downloadDocument={downloadDocument} pdfForm={pdfForm} />
      )}
    </Box>
  )
}
