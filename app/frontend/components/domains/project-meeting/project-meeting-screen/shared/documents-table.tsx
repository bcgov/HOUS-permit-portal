import { Button, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFileUploadAttachmentType } from "../../../../../types/enums"
import { IMeetingRequestDocument } from "../../../../../types/types"
import { FileDownloadButton } from "../../../../shared/base/file-download-button"
import { MeetingRequestDocumentFormValue } from "./types"

interface DocumentsTableProps {
  documents: MeetingRequestDocumentFormValue[]
  onRemoveFile: (documentId: string) => void
  onUndoRemoveFile?: (documentId: string) => void
}

export const DocumentsTable = ({ documents, onRemoveFile, onUndoRemoveFile }: DocumentsTableProps) => {
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
            const isDestroyed = !!doc._destroy

            return (
              <Tr key={documentId} opacity={isDestroyed ? 0.7 : 1}>
                <Td>
                  {doc.id ? (
                    <FileDownloadButton
                      document={doc as IMeetingRequestDocument}
                      modelType={EFileUploadAttachmentType.MeetingRequestDocument}
                    />
                  ) : (
                    <Text
                      textDecoration={isDestroyed ? "line-through" : "none"}
                      color={isDestroyed ? "gray.500" : undefined}
                    >
                      {doc.file?.metadata?.filename}
                    </Text>
                  )}
                </Td>
                <Td>
                  {isDestroyed ? (
                    onUndoRemoveFile && (
                      <Button size="sm" variant="link" onClick={() => documentId && onUndoRemoveFile(documentId)}>
                        {t("ui.undo")}
                      </Button>
                    )
                  ) : (
                    <Button size="sm" variant="link" onClick={() => documentId && onRemoveFile(documentId)}>
                      {t("ui.remove")}
                    </Button>
                  )}
                </Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </TableContainer>
  )
}
