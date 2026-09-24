import { Box, Flex, IconButton, Link, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react"
import { CloudArrowUp, X } from "@phosphor-icons/react"
import React, { useRef } from "react"
import { useTranslation } from "react-i18next"
import { formatFileSize } from "../../../utils/file-utils"

export interface IRevisionFileGridItem {
  id: string
  name: string
  size?: number | null
  href?: string
  onRemove?: () => void
}

export const RevisionFileGrid = ({
  files,
  onAddFiles,
  showDropzone = false,
}: {
  files: IRevisionFileGridItem[]
  onAddFiles?: (files: File[]) => void
  showDropzone?: boolean
}) => {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = (fileList: FileList | null) => {
    if (!fileList || !onAddFiles) return
    onAddFiles(Array.from(fileList))
  }

  return (
    <Flex direction="column" gap={3} w="full">
      {files.length > 0 && (
        <Table size="sm" variant="simple">
          <Thead bg="greys.grey03">
            <Tr>
              <Th w="40px" />
              <Th textTransform="none" color="text.secondary" fontSize="sm">
                {t("permitApplication.show.revision.fileName")}
              </Th>
              <Th textTransform="none" color="text.secondary" fontSize="sm" isNumeric>
                {t("permitApplication.show.revision.fileSize")}
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {files.map((file) => (
              <Tr key={file.id}>
                <Td>
                  {file.onRemove && (
                    <IconButton
                      aria-label={t("ui.delete")}
                      icon={<X size={16} />}
                      variant="ghost"
                      size="xs"
                      onClick={file.onRemove}
                    />
                  )}
                </Td>
                <Td>
                  {file.href ? (
                    <Link href={file.href} isExternal color="text.link">
                      {file.name}
                    </Link>
                  ) : (
                    <Text>{file.name}</Text>
                  )}
                </Td>
                <Td isNumeric>{file.size != null ? formatFileSize(file.size) : ""}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      )}
      {showDropzone && (
        <Box
          as="button"
          type="button"
          w="full"
          h="120px"
          bg="background.blueLightest"
          border="2px dashed"
          borderColor="theme.blue"
          borderRadius="lg"
          color="text.link"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault()
            addFiles(event.dataTransfer.files)
          }}
        >
          <Flex align="center" justify="center" gap={2}>
            <CloudArrowUp size={24} />
            <Text>
              {t("permitApplication.show.revision.dropFiles")}{" "}
              <Text as="span" textDecoration="underline">
                {t("permitApplication.show.revision.browseDevice")}
              </Text>
            </Text>
          </Flex>
        </Box>
      )}
      {showDropzone && (
        <input
          ref={inputRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files)
            event.target.value = ""
          }}
        />
      )}
    </Flex>
  )
}
