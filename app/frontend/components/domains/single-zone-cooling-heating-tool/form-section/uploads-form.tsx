import { Box, Button, Divider, Flex, Heading, Icon, Input, Text } from "@chakra-ui/react"
import { CloudArrowUp } from "@phosphor-icons/react"
import React, { useCallback, useRef, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { uploadFile } from "../../../../utils/uploads"

export const UploadsForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { setValue, watch } = useFormContext()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadedUrl: string | undefined = watch("uploads.drawingsPdfUrl")

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0]
      if (!file) return
      setIsUploading(true)
      try {
        const res = await uploadFile(file, file.name)
        const url =
          (res as any)?.url ||
          (res as any)?.location ||
          ((res as any)?.signed_url ? (res as any).signed_url.split("?")[0] : null)
        if (url) {
          setValue("uploads.drawingsPdfUrl", url, { shouldDirty: true, shouldTouch: true, shouldValidate: true })
        }
      } catch (e) {
        console.error("File upload failed", e)
      } finally {
        setIsUploading(false)
        setIsDragging(false)
      }
    },
    [setValue]
  )

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const openFileDialog = () => inputRef.current?.click()

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => handleFiles(e.target.files)

  return (
    <Box as="section" p={4}>
      <Heading as="h2" size="lg" mb={4}>
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

      <Box
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={openFileDialog}
        cursor={isUploading ? "not-allowed" : "pointer"}
        opacity={isUploading ? 0.7 : 1}
        borderWidth="2px"
        borderStyle="dashed"
        borderColor={isDragging ? "blue.400" : "gray.300"}
        p={10}
        borderRadius="md"
        backgroundColor={isDragging ? "blue.50" : "gray.50"}
        transition="background-color 0.2s, border-color 0.2s"
      >
        <Flex direction="column" align="center" justify="center" gap={2}>
          <Icon as={CloudArrowUp} boxSize={8} color="blue.500" />
          <Text>
            {t("singleZoneCoolingHeatingTool.uploads.dragAndDrop")}{" "}
            <Box as="span" textDecoration="underline">
              {t("singleZoneCoolingHeatingTool.uploads.browseDevice")}
            </Box>
          </Text>
          {uploadedUrl ? (
            <Text fontSize="sm" color="green.600">
              {uploadedUrl}
            </Text>
          ) : null}
          {isUploading ? <Text fontSize="sm">Uploading...</Text> : null}
        </Flex>
        <Input ref={inputRef} type="file" accept="application/pdf" display="none" onChange={onFileInputChange} />
      </Box>

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
