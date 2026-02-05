import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  ListItem,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React, { useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useUppyS3 from "../../../../hooks/use-uppy-s3"

interface IUploadOverheatingReportFormValues {
  uploads?: {
    drawingsPdfUrl?: string
    overheatingPdfMetadata?: {
      filename?: string
      size?: number
      mimeType?: string
      key?: string
    }
  }
}

const formatFileSize = (bytes?: number) => {
  if (!bytes) return "0 B"
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
}

export const UploadOverheatingReportForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { setValue, watch } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)

  const overheatingPdfMetadata = watch("overheatingPdfMetadata")
  const hasUploadedFile = Boolean(overheatingPdfMetadata?.filename)

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const uploadURL = response?.uploadURL || response?.location
    const parts = uploadURL?.split("/") ?? []
    const key = parts[parts.length - 1]

    setValue("uploads.drawingsPdfUrl", uploadURL, { shouldValidate: true, shouldDirty: true })
    setValue(
      "uploads.overheatingPdfMetadata",
      {
        filename: file.name,
        size: file.size || 0,
        mimeType: file.type || "application/pdf",
        key,
      },
      { shouldValidate: true, shouldDirty: true }
    )
  }

  const handleRemoveFile = () => {
    setValue("uploads.drawingsPdfUrl", undefined, { shouldValidate: true, shouldDirty: true })
    setValue("uploads.overheatingPdfMetadata", undefined, { shouldValidate: true, shouldDirty: true })
  }

  const uppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    maxNumberOfFiles: 1,
    autoProceed: true,
    maxFileSizeMB: 50,
    allowedFileTypes: ["application/pdf", ".pdf"],
  })

  useEffect(() => {
    const startUpload = () => setIsUploading(true)
    const endUpload = () => setIsUploading(false)

    uppy.on("upload", startUpload)
    uppy.on("upload-success", endUpload)
    uppy.on("upload-error", endUpload)

    return () => {
      uppy.off("upload", startUpload)
      uppy.off("upload-success", endUpload)
      uppy.off("upload-error", endUpload)
    }
  }, [uppy])

  return (
    <Box as="section">
      <Heading as="h2" size="lg" mb={4} variant="yellowline">
        {t("singleZoneCoolingHeatingTool.uploads.title")}
      </Heading>
      <Text mb={4}>{t("singleZoneCoolingHeatingTool.uploads.subtitle")}</Text>

      <Heading as="h3" size="md" mb={2}>
        {t("singleZoneCoolingHeatingTool.uploads.requirements")}
      </Heading>
      <UnorderedList pl={6} mb={4}>
        <ListItem>{t("singleZoneCoolingHeatingTool.uploads.pdfFormatOnly")}</ListItem>
        <ListItem>{t("singleZoneCoolingHeatingTool.uploads.oneFile")}</ListItem>
        <ListItem>{t("singleZoneCoolingHeatingTool.uploads.drawingsMustBeLegibleAndProperlyScaled")}</ListItem>
        <ListItem>{t("singleZoneCoolingHeatingTool.uploads.maximumFileSize")}</ListItem>
      </UnorderedList>

      {hasUploadedFile && (
        <TableContainer mb={6}>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th width="40px" fontWeight="bold"></Th>
                <Th fontWeight="bold" textTransform="capitalize">
                  {t("singleZoneCoolingHeatingTool.uploads.fileName", "File Name")}
                </Th>
                <Th isNumeric fontWeight="bold" textTransform="capitalize">
                  {t("singleZoneCoolingHeatingTool.uploads.size", "Size")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>
                  <IconButton
                    aria-label={t("ui.remove")}
                    color="semantic.error"
                    icon={<Icon as={Trash} />}
                    variant="ghost"
                    size="xs"
                    onClick={handleRemoveFile}
                  />
                </Td>
                <Td>
                  <Text>{overheatingPdfMetadata?.filename}</Text>
                </Td>
                <Td isNumeric>
                  <Text color="gray.600">{formatFileSize(overheatingPdfMetadata?.size)}</Text>
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Box position="relative" mb={6}>
        <Dashboard uppy={uppy} width="100%" height={276} proudlyDisplayPoweredByUppy={false} />
      </Box>
      {isUploading && (
        <Text mt={2} fontSize="sm">
          {t("singleZoneCoolingHeatingTool.uploads.uploading", "Uploading...")}
        </Text>
      )}

      <Divider my={8} />
      <Heading as="h3" size="md" mb={2}>
        {t("singleZoneCoolingHeatingTool.uploads.storageTitle") || "How we protect and store your drawings"}
      </Heading>
      <Text mb={6}>
        {t("singleZoneCoolingHeatingTool.uploads.storageDescription") ||
          "Our service partners use industry‑standard security to protect your drawings. Your drawings may be kept for a limited time, then deleted."}
      </Text>

      <Flex justify="flex-start">
        <Button
          variant="primary"
          onClick={() => {
            if (isUploading) return
            window.location.hash = "#review"
          }}
          isDisabled={isUploading}
        >
          {t("singleZoneCoolingHeatingTool.uploads.continue")}
        </Button>
      </Flex>
    </Box>
  )
}
