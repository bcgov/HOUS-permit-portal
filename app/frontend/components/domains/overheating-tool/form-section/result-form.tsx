import { Box, Button, Flex, Grid, GridItem, Heading, Icon, ListItem, OrderedList, Text } from "@chakra-ui/react"
import { ArrowsClockwise, Hourglass } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IOverheatingTool } from "../../../../models/overheating-tool"
import { useMst } from "../../../../setup/root"
import { EFileUploadAttachmentType, EPdfGenerationStatus } from "../../../../types/enums"
import { IBaseFileAttachment } from "../../../../types/types"
import { FileDownloadButton } from "../../../shared/base/file-download-button"

interface IReportReadyPanelProps {
  onExplore: () => void
  downloadDocument?: IBaseFileAttachment | null
  overheatingTool?: IOverheatingTool
}

const ReportReadyPanel: React.FC<IReportReadyPanelProps> = observer(
  ({ onExplore, downloadDocument, overheatingTool }) => {
    const { t } = useTranslation() as any
    const { getValues } = useFormContext()
    const values = getValues() || {}
    const formJson = overheatingTool?.formJson || values

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
        overheatingTool?.overheatingDocuments?.find((doc) => !doc._destroy) ||
        values?.overheatingDocumentsAttributes?.find((doc) => !doc._destroy)
      )
    }, [overheatingTool, values])

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
              modelType={EFileUploadAttachmentType.OverheatingTool}
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
)

export const ResultForm: React.FC = observer(() => {
  const { t } = useTranslation() as any
  const { overheatingToolStore } = useMst()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const overheatingTool = overheatingToolStore.currentTool
  const isReady = overheatingToolStore.isCurrentToolPdfReady
  const isFailed = overheatingTool?.pdfGenerationStatus === EPdfGenerationStatus.failed

  const [downloadDocument, setDownloadDocument] = useState<IBaseFileAttachment | null>(null)
  const lastRequestedPdfIdRef = useRef<string | null>(null)

  useEffect(() => {}, [overheatingTool?.id, overheatingTool?.pdfGenerationStatus, isReady])

  useEffect(() => {
    let interval: NodeJS.Timeout
    const status = overheatingTool?.pdfGenerationStatus
    const isGenerating = status === EPdfGenerationStatus.queued || status === EPdfGenerationStatus.generating

    if (!isReady && overheatingTool?.id && isGenerating) {
      interval = setInterval(() => {
        overheatingToolStore.fetchOverheatingTool(overheatingTool.id)
      }, 5000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isReady, overheatingTool?.id, overheatingTool?.pdfGenerationStatus])

  useEffect(() => {
    let active = true

    const buildDocument = (tool: IOverheatingTool): IBaseFileAttachment => {
      const fileData =
        tool.pdfFileData ??
        ({
          id: tool.id,
          metadata: {
            filename: `overheating_tool_${tool.id}.pdf`,
            size: 0,
            mimeType: "application/pdf",
          },
        } as any)
      return {
        id: tool.id,
        file: fileData,
        createdAt: tool.createdAt ?? new Date(),
      }
    }

    const prepareDownloadDocument = async () => {
      if (!overheatingTool) {
        if (active) setDownloadDocument(null)
        lastRequestedPdfIdRef.current = null
        return
      }

      const id = overheatingTool.id
      if (!overheatingTool.pdfFileData && lastRequestedPdfIdRef.current !== id) {
        lastRequestedPdfIdRef.current = id
        try {
          const response = await overheatingToolStore.generatePdf(id)
          if (response.success && response.data?.data) {
            overheatingToolStore.setOverheatingTool(response.data.data)
          }
        } catch (error) {
          console.error("Failed to generate PDF", error)
        }
      }

      if (!active) return

      const latestTool = overheatingToolStore.overheatingTools.find((tool) => tool.id === id) ?? overheatingTool
      if (!latestTool) {
        if (active) setDownloadDocument(null)
        return
      }

      if (active) {
        setDownloadDocument(buildDocument(latestTool))
      }
    }

    void prepareDownloadDocument()

    return () => {
      active = false
    }
  }, [overheatingTool, overheatingToolStore, isReady])

  const handleRefresh = async () => {
    if (!overheatingTool?.id) return
    setIsRefreshing(true)
    try {
      if (isFailed) {
        lastRequestedPdfIdRef.current = null
        await overheatingToolStore.generatePdf(overheatingTool.id)
      } else {
        await overheatingToolStore.fetchOverheatingTool(overheatingTool.id)
      }
    } catch (e) {
    } finally {
      setIsRefreshing(false)
    }
  }

  const navigate = useNavigate()
  const handleExplore = () => {
    navigate("/overheating")
  }

  return (
    <Box>
      {isFailed ? (
        <Box bg="red.50" p={8} borderRadius="lg" border="1px" borderColor="red.200">
          <Flex align="center" gap={3} mb={4}>
            <Icon as={Hourglass} boxSize={7} color="red.500" />
            <Heading as="h2" size="lg" lineHeight="shorter" color="red.700" m={0}>
              {t("singleZoneCoolingHeatingTool.result.failedTitle")}
            </Heading>
          </Flex>
          <Text fontSize="lg" color="red.600" mb={6}>
            {t("singleZoneCoolingHeatingTool.result.failedSubtitle")}
          </Text>
          <Button
            leftIcon={<Icon as={ArrowsClockwise} />}
            onClick={handleRefresh}
            variant="secondary"
            isLoading={isRefreshing}
          >
            {t("singleZoneCoolingHeatingTool.result.tryAgain")}
          </Button>
        </Box>
      ) : !isReady ? (
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

          <Button
            leftIcon={<Icon as={ArrowsClockwise} />}
            onClick={handleRefresh}
            variant="secondary"
            isLoading={isRefreshing}
          >
            {t("singleZoneCoolingHeatingTool.result.refreshStatus")}
          </Button>
        </Box>
      ) : (
        <ReportReadyPanel
          onExplore={handleExplore}
          downloadDocument={downloadDocument}
          overheatingTool={overheatingTool}
        />
      )}
    </Box>
  )
})
