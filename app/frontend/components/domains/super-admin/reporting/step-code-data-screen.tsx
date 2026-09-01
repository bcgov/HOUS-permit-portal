import { Box, Button, Container, FormControl, FormLabel, Heading, HStack, Select, Text, VStack } from "@chakra-ui/react"
import { FileCsv, FileZip } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"
import { TReportRangePreset } from "../../../../types/report"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"

export const StepCodeDataScreen = observer(function StepCodeDataScreen() {
  const { t } = useTranslation()
  const { reportStore, stepCodeStore } = useMst()
  const { rangePreset, setRangePreset, rangePresets } = reportStore
  const [downloadingCsv, setDownloadingCsv] = useState(false)
  const [downloadingZip, setDownloadingZip] = useState(false)

  const handleDownloadCsv = async () => {
    setDownloadingCsv(true)
    try {
      await stepCodeStore.downloadPart9StepCodeChecklistsCsv()
    } finally {
      setDownloadingCsv(false)
    }
  }

  const handleDownloadZip = async () => {
    setDownloadingZip(true)
    try {
      await stepCodeStore.downloadStepCodeFileUploadsZip()
    } finally {
      setDownloadingZip(false)
    }
  }

  return (
    <Container maxW="container.lg" w="full" p={{ base: 4, md: 8 }} as="main">
      <VStack align="stretch" spacing={6} w="full">
        <Box>
          <Heading as="h1" size="lg">
            {t("reporting.stepCodeData.title")}
          </Heading>
          <Text color="text.secondary" mt={1}>
            {t("reporting.stepCodeData.description")}
          </Text>
        </Box>

        <FormControl maxW={{ base: "full", md: "240px" }}>
          <FormLabel htmlFor="report-range">{t("reporting.controls.range")}</FormLabel>
          <Select
            id="report-range"
            value={rangePreset}
            onChange={(e) => setRangePreset(e.target.value as TReportRangePreset)}
            bg="white"
          >
            {rangePresets.map((preset) => (
              <option key={preset} value={preset}>
                {t(`reporting.controls.ranges.${preset}`)}
              </option>
            ))}
          </Select>
        </FormControl>

        <CustomMessageBox status={EFlashMessageStatus.info} description={t("reporting.stepCodeData.rangeHelp")} />

        <HStack spacing={3} flexWrap="wrap">
          <Button
            variant="primary"
            leftIcon={<FileCsv />}
            onClick={handleDownloadCsv}
            isLoading={downloadingCsv}
            loadingText={t("reporting.controls.exportCsv")}
          >
            {t("reporting.controls.exportCsv")}
          </Button>
          <Button
            variant="primary"
            leftIcon={<FileZip />}
            onClick={handleDownloadZip}
            isLoading={downloadingZip}
            loadingText={t("reporting.stepCodeData.downloadFileUploads")}
          >
            {t("reporting.stepCodeData.downloadFileUploads")}
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
})
