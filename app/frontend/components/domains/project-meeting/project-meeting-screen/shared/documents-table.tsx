import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { IMeetingRequestDocument } from "../../../../../types/types"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { MeetingRequestDocumentFormValue } from "./types"

interface DocumentsTableProps {
  documents: MeetingRequestDocumentFormValue[]
  onRemoveFile: (documentId: string) => void
}

export const DocumentsTable = ({ documents, onRemoveFile }: DocumentsTableProps) => {
  const { t } = useTranslation()

  if (documents.length === 0) return null

  return (
    <TableContainer mb={6}>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>{t("projectMeeting.fileName")}</Th>
            <Th>{t("ui.actions")}</Th>
          </Tr>
        </Thead>
        <Tbody>
          {documents.map((doc) => {
            const documentId = doc.id || doc.file?.id || doc.file?.metadata?.filename

            return (
              <Tr key={documentId}>
                <Td>
                  {doc.id ? (
                    <FileDownloadButton
                      document={doc as IMeetingRequestDocument}
                      modelType={EFileUploadAttachmentType.MeetingRequestDocument}
                    />
                  ) : (
                    doc.file?.metadata?.filename
                  )}
                </Td>
                <Td>
                  <Button size="sm" variant="link" onClick={() => documentId && onRemoveFile(documentId)}>
                    {t("ui.remove")}
                  </Button>
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
