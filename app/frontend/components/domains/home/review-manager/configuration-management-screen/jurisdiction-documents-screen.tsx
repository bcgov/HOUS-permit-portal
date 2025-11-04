import { Box, Button, Container, Flex, FormControl, FormLabel, Icon, IconButton, Text, VStack } from "@chakra-ui/react"
import { ArrowCounterClockwise, CaretLeft, Paperclip, Trash } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../../../hooks/resources/use-jurisdiction"
import useUppyS3 from "../../../../../hooks/use-uppy-s3"
import { BlueTitleBar } from "../../../../shared/base/blue-title-bar"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"

interface IJurisdictionDocumentsForm {
  jurisdictionDocumentsAttributes: Array<{
    id?: string
    file?: {
      id: string
      storage: string
      metadata: {
        size: number
        filename: string
        mimeType: string
      }
    }
    _destroy?: boolean
  }>
}

export const JurisdictionDocumentsScreen = observer(function JurisdictionDocumentsScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { currentJurisdiction, error } = useJurisdiction()
  const containerRef = useRef<HTMLDivElement>(null)

  const getDefaultValues = (): IJurisdictionDocumentsForm => {
    return {
      jurisdictionDocumentsAttributes:
        currentJurisdiction?.jurisdictionDocuments?.map((doc) => ({
          id: doc.id,
          file: doc.file,
        })) || [],
    }
  }

  const formMethods = useForm<IJurisdictionDocumentsForm>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const { control, watch, reset, handleSubmit } = formMethods
  const jurisdictionDocumentsAttributes = watch("jurisdictionDocumentsAttributes")

  const { append, update } = useFieldArray({
    control,
    name: "jurisdictionDocumentsAttributes",
  })

  useEffect(() => {
    if (currentJurisdiction) {
      reset(getDefaultValues())
    }
  }, [currentJurisdiction?.id])

  const handleUploadSuccess = (file: UppyFile<{}, {}>, response: any) => {
    // Create a new document with the uploaded file data
    // Handle both single-part (response.uploadURL) and multipart (response.key) uploads
    let key: string
    if (response.uploadURL) {
      // Single-part upload
      const parts = response.uploadURL.split("/")
      key = parts[parts.length - 1]
    } else if (response.key) {
      // Multipart upload
      key = response.key.split("/").pop() || file.id
    } else {
      key = file.id
    }
    const newDocument = {
      file: {
        id: key,
        storage: "cache",
        metadata: {
          size: file.size || 0,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
        },
      },
    }
    append(newDocument, { shouldFocus: false })
  }

  const handleRemoveFile = (documentId: string) => {
    const index = jurisdictionDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = jurisdictionDocumentsAttributes[index]
      update(index, { ...doc, _destroy: true })
    }
  }

  const handleUndoRemove = (documentId: string) => {
    const index = jurisdictionDocumentsAttributes.findIndex((doc) => (doc.id || doc.file?.id) === documentId)
    if (index !== -1) {
      const doc = jurisdictionDocumentsAttributes[index]
      update(index, { ...doc, _destroy: false })
    }
  }

  const uppy = useUppyS3({ onUploadSuccess: handleUploadSuccess, maxNumberOfFiles: 10, autoProceed: true })

  const onSubmit = async (formData: IJurisdictionDocumentsForm) => {
    if (currentJurisdiction) {
      await currentJurisdiction.update({
        jurisdictionDocumentsAttributes: formData.jurisdictionDocumentsAttributes,
      })
    }
  }

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      <BlueTitleBar title={currentJurisdiction.qualifiedName} />
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        <VStack spacing={8} align="start" w="full">
          <Button variant="link" onClick={() => navigate(-1)} leftIcon={<CaretLeft size={20} />} textDecoration="none">
            {t("ui.back")}
          </Button>
          <Flex align="center" w="100%" direction="column" alignItems="flex-start">
            <Text as="h1" fontSize="3xl" fontWeight="bold" mb={0}>
              {t("home.configurationManagement.jurisdictionDocuments.title")}
            </Text>
            <Text color="text.secondary" fontSize="lg" mt={2}>
              {t("home.configurationManagement.jurisdictionDocuments.description")}
            </Text>
          </Flex>

          <FormProvider {...formMethods}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
              <VStack spacing={6} align="stretch" w="full">
                <Box as="section" w="full" boxShadow="md" borderRadius="xl" bg="greys.grey10" ref={containerRef}>
                  <Box as="header" w="full" px={6} py={3} bg="theme.blueAlt" borderTopRadius="xl">
                    <Text as="h3" fontSize="xl" color="greys.white" fontWeight={700}>
                      {t("home.configurationManagement.jurisdictionDocuments.documentsTitle")}
                    </Text>
                  </Box>
                  <VStack spacing={4} w="full" alignItems="flex-start" px={6} pb={6} pt={3}>
                    <FormControl>
                      <FormLabel>{t("home.configurationManagement.jurisdictionDocuments.documentsLabel")}</FormLabel>
                      {jurisdictionDocumentsAttributes?.map((doc) => (
                        <Flex
                          key={doc.id || doc.file?.id}
                          justifyContent="space-between"
                          alignItems="center"
                          gap={2}
                          mb={1}
                        >
                          <Text textDecoration={doc._destroy ? "line-through" : "none"}>
                            {doc.file?.metadata?.filename}
                          </Text>
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
                        </Flex>
                      ))}
                      <Box position="relative" mt={4}>
                        <Dashboard uppy={uppy} height={300} width="100%" />
                      </Box>
                    </FormControl>
                  </VStack>
                </Box>

                <Flex justify="flex-end" w="full">
                  <Button type="submit" variant="primary" size="lg" leftIcon={<Paperclip size={20} />}>
                    {t("ui.save")}
                  </Button>
                </Flex>
              </VStack>
            </form>
          </FormProvider>
        </VStack>
      </Container>
    </Flex>
  )
})
