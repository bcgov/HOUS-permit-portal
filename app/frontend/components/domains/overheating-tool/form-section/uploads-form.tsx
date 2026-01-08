import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Icon,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react"
import { Trash } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React, { useEffect, useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useUppyS3 from "../../../../hooks/use-uppy-s3"
import { EFileUploadAttachmentType } from "../../../../types/enums"
import { formatBytes } from "../../../../utils/utility-functions"
import { FileDownloadButton } from "../../../shared/base/file-download-button"

import { useSectionCompletion } from "../../../../hooks/use-section-completion"

export const UploadsForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { watch, control } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)

  const validate = React.useCallback((values: any) => {
    const docs = values?.overheatingDocumentsAttributes || []
    return docs.some((doc: any) => !doc._destroy)
  }, [])

  useSectionCompletion({ key: "uploads", validate })

  const { fields, append, update } = useFieldArray({
    control,
    name: "overheatingDocumentsAttributes",
  })

  const overheatingDocumentsAttributes = watch("overheatingDocumentsAttributes") || []

  const uploadedUrl: string | undefined = watch("uploads.drawingsPdfUrl")

  const handleRemoveFile = (documentId: string) => {
    const index = overheatingDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = overheatingDocumentsAttributes[index]
      update(index, { ...doc, _destroy: true })
    }
  }

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const parts = response.uploadURL.split("/")
    const key = parts[parts.length - 1]
    const newDocument = {
      file: {
        id: key,
        storage: "cache",
        metadata: {
          filename: file.name,
          size: file.size || 0,
          mimeType: file.type || "application/pdf",
        },
      },
    }
    append(newDocument as any, { shouldFocus: false })
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
      <Box as="ul" pl={6} mb={4}>
        <Box as="li">{t("singleZoneCoolingHeatingTool.uploads.pdfFormatOnly")}</Box>
        <Box as="li">{t("singleZoneCoolingHeatingTool.uploads.oneFile")}</Box>
        <Box as="li">{t("singleZoneCoolingHeatingTool.uploads.drawingsMustBeLegibleAndProperlyScaled")}</Box>
        <Box as="li">{t("singleZoneCoolingHeatingTool.uploads.maximumFileSize")}</Box>
      </Box>

      {overheatingDocumentsAttributes && overheatingDocumentsAttributes.length > 0 && (
        <TableContainer mb={6}>
          <Table variant="simple" size="sm">
            <Thead bg="gray.50">
              <Tr>
                <Th width="40px" fontWeight="bold"></Th>
                <Th fontWeight="bold" textTransform="capitalize">
                  {t("preCheck.sections.uploadDrawings.fileName", "File Name")}
                </Th>
                <Th isNumeric fontWeight="bold" textTransform="capitalize">
                  {t("preCheck.sections.uploadDrawings.size", "Size")}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {overheatingDocumentsAttributes
                .filter((doc) => !doc._destroy)
                .map((doc) => (
                  <Tr key={doc.id || doc.file?.id}>
                    <Td>
                      <IconButton
                        aria-label={t("ui.remove")}
                        color="semantic.error"
                        icon={<Icon as={Trash} />}
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveFile(doc.id || doc.file?.id)}
                      />
                    </Td>
                    <Td>
                      {doc.id ? (
                        <FileDownloadButton document={doc} modelType={EFileUploadAttachmentType.OverheatingDocument} />
                      ) : (
                        <Text>{doc.file?.metadata?.filename}</Text>
                      )}
                    </Td>
                    <Td isNumeric>
                      <Text>{formatBytes(doc.file?.metadata?.size || 0)}</Text>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Box borderWidth="2px" borderStyle="dashed" borderRadius="md" borderColor="gray.300">
        <Dashboard uppy={uppy} height={100} width="100%" proudlyDisplayPoweredByUppy={false} />
      </Box>
      {uploadedUrl ? (
        <Text mt={2} fontSize="sm" color="green.600">
          {uploadedUrl}
        </Text>
      ) : null}
      {isUploading ? (
        <Text mt={2} fontSize="sm">
          Uploading...
        </Text>
      ) : null}

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
