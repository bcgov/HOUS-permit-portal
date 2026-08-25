import { Button, Flex, Heading, HStack, Link, Tag, Text } from "@chakra-ui/react"
import { Download, WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { datefnsTableDateFormat } from "../../../constants"
import { IInfoDocument } from "../../../models/info-document"
import { formatFileSize, getFileExtension } from "../../../utils/file-utils"

export const InfoDocumentCard = observer(function InfoDocumentCard({ document }: { document: IInfoDocument }) {
  const { t } = useTranslation()
  const translate = t as any
  const openUrl = document.documentFile?.fileUrl
  const downloadUrl = document.documentFile?.downloadUrl
  const file = document.documentFile?.file
  const filename = file?.metadata?.filename
  const fileDetails = fileDetailsLabel(filename, file?.metadata?.mimeType, file?.metadata?.size)
  const updatedLabel = document.updatedAt
    ? translate("infoDocuments.index.updated", { date: format(document.updatedAt, datefnsTableDateFormat) })
    : null

  return (
    <Flex
      direction="column"
      border="1px solid"
      borderColor="border.light"
      p={5}
      bg="white"
      h="full"
      gap={4}
    >
      {document.topics.length > 0 && (
        <HStack spacing={2} wrap="wrap">
          {document.topics.map((topic) => (
            <Tag
              key={topic}
              bg="semantic.infoLight"
              color="text.link"
              textTransform="none"
              fontSize="sm"
              fontWeight="bold"
            >
              {topic}
            </Tag>
          ))}
        </HStack>
      )}

      <Heading as="h2" fontSize="md">
        {openUrl ? (
          <Link
            href={openUrl}
            color="text.link"
            isExternal
            rel="noopener noreferrer"
            aria-label={translate("infoDocuments.index.openAria", { title: document.title })}
          >
            {document.title}
          </Link>
        ) : (
          document.title
        )}
      </Heading>

      {document.description && (
        <Text color="text.secondary" fontSize="sm">
          {document.description}
        </Text>
      )}

      <Flex mt="auto" pt={2} gap={3} wrap="wrap" align="center" justify="space-between">
        <HStack spacing={3} align="center">
          {downloadUrl ? (
            <Button
              as="a"
              href={downloadUrl}
              variant="secondary"
              leftIcon={<Download size={16} aria-hidden />}
              aria-label={translate("infoDocuments.index.downloadAria", { title: document.title })}
            >
              {t("ui.download")}
            </Button>
          ) : (
            <Text color="greys.grey01" fontSize="sm" display="inline-flex" alignItems="center" gap={1}>
              <WarningCircle size={16} aria-hidden />
              {t("ui.fileUnavailable")}
            </Text>
          )}
          {fileDetails && (
            <Text fontSize="sm" color="text.secondary">
              {fileDetails}
            </Text>
          )}
        </HStack>
        {updatedLabel && (
          <Text fontSize="sm" color="text.secondary">
            {updatedLabel}
          </Text>
        )}
      </Flex>
    </Flex>
  )
})

function fileDetailsLabel(filename?: string, mimeType?: string, size?: number) {
  if (!filename) return null
  const details = [getFileExtension(filename, mimeType), formatFileSize(size)].filter(Boolean)
  return details.length ? details.join(", ") : null
}
