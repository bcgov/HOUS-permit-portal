import { Box, Button, Flex, Grid, GridItem, Heading, Icon, Link, ListItem, OrderedList, Text } from "@chakra-ui/react"
import { ArrowsClockwise, Hourglass } from "@phosphor-icons/react"
import React, { useMemo, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"

const ReportReadyPanel: React.FC<{ onDownload: () => void; onExplore: () => void }> = ({ onDownload, onExplore }) => {
  const { t } = useTranslation() as any
  const { getValues } = useFormContext()
  const values = getValues() || {}
  const addressLines = useMemo(() => {
    const a = values?.buildingLocation?.address
    const city = values?.buildingLocation?.city
    const prov = values?.buildingLocation?.province
    const postal = values?.buildingLocation?.postalCode
    return {
      line1: [a, city, prov].filter(Boolean).join(", "),
      line2: postal || "—",
    }
  }, [getValues])

  const uploadedName = useMemo(() => {
    const url: string | undefined = values?.uploads?.drawingsPdfUrl
    if (!url) return "—"
    try {
      const u = new URL(url)
      const base = u.pathname.split("/").pop()
      return base || url
    } catch {
      const parts = url.split("/")
      return parts[parts.length - 1] || url
    }
  }, [getValues])

  return (
    <Box>
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
          <Text>—</Text>
        </Box>
        <Box>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.applicationNumber")}
          </Text>
          <Text>—</Text>
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
          <Text>{values?.buildingLocation?.city || "—"}</Text>
        </GridItem>
        <GridItem colSpan={2}>
          <Text fontWeight="bold" mb={1}>
            {t("singleZoneCoolingHeatingTool.ready.uploadedFiles")}
          </Text>
          <Text>{uploadedName}</Text>
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
        <Link onClick={onDownload} color="blue.600" textDecoration="underline">
          {t("singleZoneCoolingHeatingTool.ready.downloadPdf")}
        </Link>
      </Text>
    </Box>
  )
}

export const ResultForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { pdfFormStore } = useMst()
  const [ready, setReady] = useState(false)

  const handleRefresh = async () => {
    try {
      await pdfFormStore.searchPdfForms({ page: 1, countPerPage: pdfFormStore.countPerPage })
      setReady(true)
    } catch (e) {
      // swallow
    }
  }
  const handleExplore = () => {
    window.location.href = "/overheating"
  }

  const handleDownload = async () => {
    const id = (pdfFormStore.lastCreatedForm as any)?.id || pdfFormStore.pdfForms?.[0]?.id
    if (!id) return
    try {
      const response = await pdfFormStore.environment.api.downloadPdf(id)
      if (!response.data || (response.data as Blob).size === 0) return
      const blob = new Blob([response.data as Blob], { type: "application/pdf" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `pdf_form_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (e) {}
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
        <ReportReadyPanel onExplore={handleExplore} onDownload={handleDownload} />
      )}
    </Box>
  )
}
