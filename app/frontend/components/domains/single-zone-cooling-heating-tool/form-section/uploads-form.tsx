import { Box, Button, Divider, Flex, Heading, Text } from "@chakra-ui/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React, { useCallback, useEffect, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import useUppyS3 from "../../../../hooks/use-uppy-s3"

export const UploadsForm: React.FC = () => {
  const { t } = useTranslation() as any
  const { setValue, watch } = useFormContext()
  const [isUploading, setIsUploading] = useState(false)

  const uploadedUrl: string | undefined = watch("uploads.drawingsPdfUrl")

  const handleUploadSuccess = useCallback(
    (_file: UppyFile<{}, {}>, response: any) => {
      const url =
        response?.uploadURL ??
        response?.location ??
        response?.body?.location ??
        response?.body?.url ??
        response?.uploadResponse?.body?.location ??
        response?.uploadResponse?.body?.url ??
        response?.uploadResponse?.body?.Location ??
        response?.url
      if (!url) return
      setValue("uploads.drawingsPdfUrl", url, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      })
    },
    [setValue]
  )

  const uppy = useUppyS3({
    onUploadSuccess: handleUploadSuccess,
    maxNumberOfFiles: 1,
    autoProceed: true,
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
