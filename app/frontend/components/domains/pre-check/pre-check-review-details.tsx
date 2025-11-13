import { Box, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPreCheck } from "../../../models/pre-check"
import { EFileUploadAttachmentType } from "../../../types/enums"
import { FileDownloadButton } from "../../shared/base/file-download-button"

interface IPreCheckReviewDetailsProps {
  preCheck: IPreCheck
}

export const PreCheckReviewDetails = observer(function PreCheckReviewDetails({
  preCheck,
}: IPreCheckReviewDetailsProps) {
  const { t } = useTranslation()

  const designDocuments = preCheck?.designDocuments || []
  const uploadedFilesCount = designDocuments.filter((doc) => !doc._destroy).length

  return (
    <VStack spacing={6} align="stretch" mb={8}>
      {/* Address */}
      <Box>
        <Heading as="h3" size="sm" mb={2} fontWeight="bold">
          {t("preCheck.sections.confirmSubmission.address", "Address")}
        </Heading>
        {preCheck?.fullAddress ? <Text>{preCheck.fullAddress}</Text> : <Text color="text.secondary">—</Text>}
      </Box>

      {/* Jurisdiction */}
      <Box>
        <Heading as="h3" size="sm" mb={2} fontWeight="bold">
          {t("preCheck.sections.confirmSubmission.jurisdiction", "Jurisdiction")}
        </Heading>
        {preCheck?.jurisdiction?.name ? (
          <Text>{preCheck.jurisdiction.qualifiedName}</Text>
        ) : (
          <Text color="text.secondary">—</Text>
        )}
      </Box>

      {/* Uploaded Files */}
      <Box>
        <Heading as="h3" size="sm" mb={2} fontWeight="bold">
          {t("preCheck.sections.confirmSubmission.uploadedFiles", "Uploaded files ({{count}})", {
            count: uploadedFilesCount,
          })}
        </Heading>
        {designDocuments.length > 0 ? (
          <VStack align="stretch" spacing={1}>
            {designDocuments
              .filter((doc) => !doc._destroy)
              .map((doc) => (
                <FileDownloadButton
                  key={doc.id || doc.file?.id}
                  document={doc}
                  modelType={EFileUploadAttachmentType.DesignDocument}
                  variant="link"
                  size="sm"
                />
              ))}
          </VStack>
        ) : (
          <Text color="text.secondary">{t("preCheck.sections.confirmSubmission.noFiles", "No files uploaded")}</Text>
        )}
      </Box>
    </VStack>
  )
})
