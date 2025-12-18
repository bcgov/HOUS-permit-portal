import {
  Box,
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
import { observer } from "mobx-react-lite"
import React from "react"
import { useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import useUppyS3 from "../../../../hooks/use-uppy-s3"
import { useMst } from "../../../../setup/root"
import { EFileUploadAttachmentType } from "../../../../types/enums"
import { IDesignDocument } from "../../../../types/types"
import { FileDownloadButton } from "../../../shared/base/file-download-button"
import { PreCheckBackLink } from "../pre-check-back-link"
import { FormFooter } from "./form-footer"

interface IUploadDrawingsFormData {
  designDocumentsAttributes: IDesignDocument[]
}

export const UploadDrawings = observer(function UploadDrawings() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const formatFileSize = (bytes: number | undefined) => {
    if (!bytes) return "0 B"
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<IUploadDrawingsFormData>({
    defaultValues: {
      designDocumentsAttributes: currentPreCheck?.designDocuments || [],
    },
  })

  const { fields, append, update } = useFieldArray({
    control,
    name: "designDocumentsAttributes",
  })

  const designDocumentsAttributes = watch("designDocumentsAttributes")

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    const parts = response.uploadURL.split("/")
    const key = parts[parts.length - 1]
    const newDocument = {
      preCheckId: currentPreCheck?.id,
      file: {
        id: key,
        storage: "cache",
        metadata: {
          size: file.size || 0,
          filename: file.name,
          mimeType: file.type || "application/pdf",
        },
      },
      createdAt: new Date(),
    }
    append(newDocument as any, { shouldFocus: false })
  }

  const handleRemoveFile = (documentId: string) => {
    const index = designDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = designDocumentsAttributes[index]
      update(index, { ...doc, _destroy: true })
    }
  }

  const handleUndoRemove = (documentId: string) => {
    const index = designDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = designDocumentsAttributes[index]
      update(index, { ...doc, _destroy: false })
    }
  }

  const onSubmit = async (data: IUploadDrawingsFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      designDocumentsAttributes: data.designDocumentsAttributes,
    })
  }

  const uppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    maxNumberOfFiles: 1,
    autoProceed: true,
    maxFileSizeMB: 200,
    allowedFileTypes: ["application/pdf", ".pdf", ".chk"],
  })

  return (
    <Box>
      <PreCheckBackLink />
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.uploadDrawings.title", "Upload drawings")}
      </Heading>
      <Text mb={6}>
        {t(
          "preCheck.sections.uploadDrawings.description",
          "Upload a single PDF that includes the drawings you would normally submit with a building permit application."
        )}
      </Text>

      <Heading as="h3" size="md" mb={4}>
        {t("preCheck.sections.uploadDrawings.fileRequirementsTitle", "File requirements")}
      </Heading>
      <UnorderedList pl={6} mb={6}>
        <ListItem>{t("preCheck.sections.uploadDrawings.requirement1", "PDF format only")}</ListItem>
        <ListItem>{t("preCheck.sections.uploadDrawings.requirement2", "One file, not multiple PDFs")}</ListItem>
        <ListItem>
          {t(
            "preCheck.sections.uploadDrawings.requirement3",
            "Architectural drawings must be legible and properly scaled"
          )}
        </ListItem>
        <ListItem>{t("preCheck.sections.uploadDrawings.requirement4", "Maximum file size: 200 MB")}</ListItem>
      </UnorderedList>

      {designDocumentsAttributes && designDocumentsAttributes.length > 0 && (
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
              {designDocumentsAttributes.map((doc) => (
                <Tr key={doc.id || doc.file?.id}>
                  <Td>
                    {!currentPreCheck?.isSubmitted && !doc._destroy && (
                      <IconButton
                        aria-label={t("ui.remove")}
                        color="semantic.error"
                        icon={<Icon as={Trash} />}
                        variant="ghost"
                        size="xs"
                        onClick={() => handleRemoveFile(doc.id || doc.file?.id)}
                      />
                    )}
                  </Td>
                  <Td>
                    {doc.id ? (
                      <FileDownloadButton document={doc} modelType={EFileUploadAttachmentType.DesignDocument} />
                    ) : (
                      <Text
                        textDecoration={doc._destroy ? "line-through" : "none"}
                        color={doc._destroy ? "gray.500" : "blue.500"}
                        textDecorationLine={doc._destroy ? "line-through" : "underline"}
                      >
                        {doc.file?.metadata?.filename}
                      </Text>
                    )}
                  </Td>
                  <Td isNumeric>
                    <Text color="gray.600">{formatFileSize(doc.file?.metadata?.size)}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      {!currentPreCheck?.isSubmitted && !currentPreCheck?.isUploadDrawingsComplete && (
        <Box position="relative" mb={6}>
          <Dashboard uppy={uppy} width="100%" height={276} proudlyDisplayPoweredByUppy={false} />
        </Box>
      )}

      <Box mb={6}>
        <Heading as="h3" size="md" mb={3}>
          {t("preCheck.sections.uploadDrawings.protectionTitle", "How {{provider}} protects and stores your drawings", {
            provider: currentPreCheck?.providerName,
          })}
        </Heading>
        <Text mb={3}>
          {t(
            "preCheck.sections.uploadDrawings.protectionDescription1",
            "Our service partners use industry-standard security to protect your drawings. {{provider}} will keep your drawings for up to 150 days, then delete them. All drawings will be deleted on December 31, 2025, when the beta testing period ends.",
            {
              provider: currentPreCheck?.providerName,
            }
          )}
        </Text>
      </Box>

      <FormFooter<IUploadDrawingsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
