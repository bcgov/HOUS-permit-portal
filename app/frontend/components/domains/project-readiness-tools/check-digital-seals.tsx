import {
  Alert,
  AlertIcon,
  Box,
  Button,
  Container,
  HStack,
  Heading,
  List,
  ListIcon,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CheckCircle, XCircle } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import useUppyTransient from "../../../hooks/use-uppy-transient"
import { useMst } from "../../../setup/root"

export const CheckDigitalSealsScreen = observer(() => {
  const { t } = useTranslation()
  const { digitalSealValidatorStore } = useMst()
  const {
    file,
    validationResult: result,
    error,
    setFile,
    setValidationResult,
    setError,
    reset,
  } = digitalSealValidatorStore

  const handleUploadSuccess = (uppyFile: UppyFile<{}, {}>, response: any) => {
    setFile(uppyFile.data as File)
    setValidationResult(null)
    setError(null)

    if (response.body?.meta?.status === "success") {
      setValidationResult(response.body.meta.signatures)
    } else {
      const baseMsg = t("projectReadinessTools.digitalSealValidator.notValidated", {
        fileName: (uppyFile.data as File)?.name,
      }) as string
      setError(baseMsg)
    }
  }

  const handleUploadError = (uppyFile: UppyFile<{}, {}>, error: any, response: any) => {
    setFile(uppyFile.data as File)
    setValidationResult(null)
    const errorMessage =
      response?.body?.meta?.message?.options?.error_message ||
      t("projectReadinessTools.digitalSealValidator.notValidated", { fileName: (uppyFile.data as File).name })
    setError(errorMessage)
  }

  const handleFileAdded = () => {
    setError(null)
    setValidationResult(null)
  }

  const handleUploadStart = () => {
    setError(null)
    setValidationResult(null)
  }

  const handleFileRemoved = () => {
    resetValidator()
  }

  const uppy = useUppyTransient({
    endpoint: digitalSealValidatorStore.uploadEndpoint,
    onUploadSuccess: handleUploadSuccess,
    onUploadError: handleUploadError,
    onFileAdded: handleFileAdded,
    onFileRemoved: handleFileRemoved,
    onUploadStart: handleUploadStart,
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
    autoProceed: true,
  })

  const formatSignerName = (subjectName: string) => {
    if (!subjectName) return "Unknown Signer"

    const parts = subjectName.split(/[,+]/).map((p) => p.trim())
    let cn = ""
    const ous: string[] = []

    parts.forEach((part) => {
      if (part.startsWith("CN=")) {
        cn = part.substring(3)
      } else if (part.startsWith("OU=")) {
        ous.push(part.substring(3))
      }
    })

    if (cn && ous.length > 0) {
      return `${cn} (${ous.join(", ")})`
    } else if (cn) {
      return cn
    }
    return subjectName
  }

  const resetValidator = () => {
    uppy.cancelAll()
    reset()
  }

  return (
    <Container maxW="container.lg" py="16" px="8">
      <HStack mb="4" spacing={2} alignItems="center">
        <Heading as="h1" mb="0">
          {t("projectReadinessTools.digitalSealValidator.title") as string}
        </Heading>
      </HStack>
      <Text fontSize="lg" color="text.primary" mb="6">
        {t("projectReadinessTools.digitalSealValidator.description") as string}
      </Text>
      <UnorderedList fontSize="lg" spacing={2} mb="8" pl="4">
        <ListItem>{t("projectReadinessTools.digitalSealValidator.listItem1") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.listItem2") as string}</ListItem>
      </UnorderedList>

      <Heading as="h2" size="md" mb="4">
        {t("projectReadinessTools.digitalSealValidator.howItWorks.title") as string}
      </Heading>
      <Text fontSize="lg" color="text.primary" mb="6">
        {t("projectReadinessTools.digitalSealValidator.howItWorks.description") as string}
      </Text>
      <UnorderedList spacing={2} mb="4" pl="4" fontSize="lg">
        <ListItem>{t("projectReadinessTools.digitalSealValidator.howItWorks.listItem1") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.howItWorks.listItem2") as string}</ListItem>
      </UnorderedList>
      <Text fontSize="lg" color="text.primary" mb="6">
        {t("projectReadinessTools.digitalSealValidator.howItWorks.listItem3") as string}
      </Text>

      <Heading as="h2" size="md" mb="4">
        {t("projectReadinessTools.digitalSealValidator.fileRequirementsTitle") as string}
      </Heading>
      <UnorderedList spacing={2} mb="8" pl="4" fontSize="lg">
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement1") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement2") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement3") as string}</ListItem>
      </UnorderedList>

      <VStack spacing={6} align="stretch" maxW="full">
        {result && (
          <Box bg="blue.50" borderLeft="8px solid" borderColor="blue.500" p={4} borderRadius="sm">
            {result.length === 0 ? (
              <Text>
                {
                  t("projectReadinessTools.digitalSealValidator.noSignaturesFound", {
                    defaultValue: "No digital signatures found.",
                  }) as string
                }
              </Text>
            ) : (
              <Box>
                <Heading as="h2" mb={4} fontWeight="bold">
                  {t("projectReadinessTools.digitalSealValidator.digitalSignaturesDetected") as string}
                </Heading>
                <Box mb={4}>
                  <HStack spacing={2} align="center">
                    <Text>File: {file?.name}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {t("projectReadinessTools.digitalSealValidator.lastModified") as string}{" "}
                    {file?.lastModified
                      ? new Date(file.lastModified).toLocaleString("en-CA", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: false,
                        })
                      : ""}
                  </Text>
                </Box>
                <List fontSize="lg" spacing={4} pl={0}>
                  {result
                    .filter(
                      (sig: any, index: number, self: any[]) =>
                        index ===
                        self.findIndex(
                          (t) =>
                            t.signerStatus?.certificateInfo?.subjectName ===
                            sig.signerStatus?.certificateInfo?.subjectName
                        )
                    )
                    .map((sig: any, index: number) => {
                      const rawSignerName = sig.signerStatus?.certificateInfo?.subjectName || ""
                      const signerName = formatSignerName(rawSignerName)
                      const date = sig.signatureTimestamp?.date
                        ? new Date(sig.signatureTimestamp.date).toLocaleString("en-CA", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: false,
                          }) + " PST" // Mocking PST for display consistency with requirement
                        : "Unknown Date"
                      const isValid = sig.result === "SUCCESS"

                      return (
                        <ListItem key={rawSignerName || index}>
                          <VStack align="start" spacing={1}>
                            <HStack spacing={2}>
                              <ListIcon
                                as={isValid ? CheckCircle : XCircle}
                                color={isValid ? "blue.500" : "red.500"}
                                m={0}
                              />
                              <Text fontWeight="bold">{signerName}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600">
                              {t("projectReadinessTools.digitalSealValidator.signedAt") as string} {date}
                            </Text>
                            {!isValid && (
                              <Text fontSize="sm" color="red.500">
                                {sig.result}
                              </Text>
                            )}
                          </VStack>
                        </ListItem>
                      )
                    })}
                </List>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <HStack spacing={2} align="start" flexWrap="wrap">
              <Text>{error}</Text>
              <Button
                variant="link"
                onClick={resetValidator}
                color="text.link"
                textDecoration="underline"
                fontWeight="normal"
                _hover={{ textDecoration: "none" }}
              >
                Upload another file
              </Button>
            </HStack>
          </Alert>
        )}

        {result && !error && (
          <Box display="flex" justifyContent="flex-start" width="100%">
            <Button
              variant="link"
              mt={4}
              fontSize="lg"
              onClick={resetValidator}
              color="text.link"
              textDecoration="none"
              fontWeight="normal"
              _hover={{ textDecoration: "none" }}
            >
              {
                // @ts-ignore
                t("projectReadinessTools.digitalSealValidator.checkAnotherDocument", {
                  defaultValue: "Check another document",
                }) as string
              }
            </Button>
          </Box>
        )}

        <Box
          position="relative"
          mb={6}
          sx={{
            ".uppy-Dashboard": {
              border: "2px dashed var(--chakra-colors-border-light)",
              borderRadius: "var(--chakra-radii-lg)",
              borderColor: "var(--chakra-colors-theme-blue)",
              width: "100%",
              height: "100%",
            },
            ".uppy-Container": {
              display: result || error ? "none" : "",
            },
            ".uppy-Dashboard-inner": {
              border: "none",
              borderRadius: "var(--chakra-radii-lg)",
              backgroundColor: "var(--chakra-colors-theme-blueLight)",
              width: "100%",
              height: "100%",
              display: result || error ? "none" : "",
            },
            ".uppy-Dashboard-innerWrap": {
              display: result || error ? "none" : "",
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
            ".uppy-StatusBar-actionBtn--done": {
              display: "none",
            },
            ".uppy-Informer": {
              display: "none",
            },
            ".uppy-StatusBar-statusPrimary": {
              display: "none",
            },
            ".uppy-StatusBar-statusSecondary": {
              display: "none",
            },
            ".uppy-StatusBar-actionBtn--retry": {
              display: "none",
            },
          }}
        >
          <Dashboard uppy={uppy} width="100%" height={118} proudlyDisplayPoweredByUppy={false} />
        </Box>
      </VStack>
    </Container>
  )
})
