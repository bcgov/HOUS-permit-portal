import { Text, VStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { IMeetingRequestDocument } from "../../../../../types/types"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { DetailSection } from "../detail-section"

interface DocumentsSectionProps {
  documents: IMeetingRequestDocument[]
}

export const DocumentsSection = ({ documents }: DocumentsSectionProps) => {
  const { t } = useTranslation()

  return (
    <DetailSection title={t("projectMeeting.detail.documents")}>
      <Text mb={4}>{t("projectMeeting.detail.documentsDescription")}</Text>
      {documents.length > 0 ? (
        <VStack align="flex-start" spacing={3}>
          {documents.map((document) => (
            <FileDownloadButton
              key={document.id || document.file?.id}
              document={document}
              modelType={EFileUploadAttachmentType.MeetingRequestDocument}
              color="text.link"
              px={0}
            />
          ))}
        </VStack>
      ) : (
        <Text color="text.secondary">{t("projectMeeting.detail.noDocuments")}</Text>
      )}
    </DetailSection>
  )
}
