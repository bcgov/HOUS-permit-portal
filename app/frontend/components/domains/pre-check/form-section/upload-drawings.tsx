import { Box, Button, Flex, Heading, Icon, IconButton, Text } from "@chakra-ui/react"
import { ArrowCounterClockwise, Trash } from "@phosphor-icons/react"
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
import { EFileUploadAttachmentType, EPreCheckServicePartner } from "../../../../types/enums"
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
    maxFileSizeMB: 100,
    allowedFileTypes: ["application/pdf", ".pdf"],
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
      <Box as="ul" pl={6} mb={6}>
        <li>{t("preCheck.sections.uploadDrawings.requirement1", "PDF format only")}</li>
        <li>{t("preCheck.sections.uploadDrawings.requirement2", "One file, not multiple PDFs")}</li>
        <li>
          {t(
            "preCheck.sections.uploadDrawings.requirement3",
            "Architectural drawings must be legible and properly scaled"
          )}
        </li>
        <li>{t("preCheck.sections.uploadDrawings.requirement4", "Maximum file size: 100 MB")}</li>
      </Box>

      {designDocumentsAttributes?.map((doc) => (
        <Flex key={doc.id || doc.file?.id} justifyContent="space-between" alignItems="center" gap={2} mb={2}>
          {doc.id ? (
            <FileDownloadButton document={doc} modelType={EFileUploadAttachmentType.DesignDocument} />
          ) : (
            <Text textDecoration={doc._destroy ? "line-through" : "none"}>{doc.file?.metadata?.filename}</Text>
          )}
          {!currentPreCheck?.isSubmitted && (
            <>
              {doc._destroy ? (
                <Button
                  variant="link"
                  size="sm"
                  color="semantic.info"
                  leftIcon={<Icon as={ArrowCounterClockwise} />}
                  onClick={() => handleUndoRemove(doc.id || doc.file?.id)}
                >
                  {t("ui.undo")}
                </Button>
              ) : (
                <IconButton
                  aria-label={t("ui.remove")}
                  color="semantic.error"
                  icon={<Icon as={Trash} />}
                  variant="tertiary"
                  size="sm"
                  onClick={() => handleRemoveFile(doc.id || doc.file?.id)}
                />
              )}
            </>
          )}
        </Flex>
      ))}

      {!currentPreCheck?.isSubmitted && (
        <Box
          position="relative"
          mb={6}
          sx={{
            ".uppy-Dashboard": {
              border: "2px dashed var(--chakra-colors-border-light)",
              borderRadius: "var(--chakra-radii-lg)",
            },
            ".uppy-Dashboard-inner": {
              border: "none",
              borderRadius: "var(--chakra-radii-lg)",
            },
            ".uppy-Dashboard-dropFilesHereHint": {
              display: "none",
            },
            ".uppy-DashboardContent-title": {
              display: "none",
            },
            ".uppy-DashboardContent-back": {
              display: "none",
            },
            ".uppy-DashboardContent-bar": {
              display: "none",
            },
          }}
        >
          <Dashboard uppy={uppy} height={276} proudlyDisplayPoweredByUppy={false} />
        </Box>
      )}

      {currentPreCheck?.servicePartner === EPreCheckServicePartner.archistar && (
        <Box mb={6}>
          <Heading as="h3" size="md" mb={3}>
            {t("preCheck.sections.uploadDrawings.protectionTitle", "How Archistar protects and stores your drawings")}
          </Heading>
          <Text mb={3}>
            {t(
              "preCheck.sections.uploadDrawings.protectionDescription1",
              "Our service partners use industry-standard security to protect your drawings. Archistar will keep your drawings for up to 150 days, then delete them. All drawings will be deleted on December 31, 2025, when the beta testing period ends."
            )}
          </Text>
        </Box>
      )}

      <FormFooter<IUploadDrawingsFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
