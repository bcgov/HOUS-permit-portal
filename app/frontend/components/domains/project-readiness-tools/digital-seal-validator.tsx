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
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CheckCircle, Info, XCircle } from "@phosphor-icons/react"
import { UppyFile } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import "@uppy/dashboard/dist/style.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import useUppyTransient from "../../../hooks/use-uppy-transient"
import { useMst } from "../../../setup/root"

export const DigitalSealValidatorScreen = observer(() => {
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
      // Explicit cast to avoid type issues
      const key = "projectReadinessTools.digitalSealValidator.notValidated" as any
      // @ts-ignore
      const errorMsg = t(key, { defaultValue: "Document could not be validated." }) as string
      setError(errorMsg)
    }
  }

  const handleUploadError = (uppyFile: UppyFile<{}, {}>, error: any, response: any) => {
    console.error("Upload error:", error, response)
    setFile(uppyFile.data as File)
    setValidationResult(null)
    const errorMessage = response?.body?.meta?.message?.options?.error_message || "Document could not be validated."
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
        <Popover trigger="hover" placement="right">
          <PopoverTrigger>
            <Box as="button" aria-label="Help" display="flex" alignItems="center" color="blue.500" cursor="pointer">
              <Info size={24} />
            </Box>
          </PopoverTrigger>
          <PopoverContent fontSize="sm" p={2} mt={16} maxW="sm">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              <Text mb={3}>
                {
                  // @ts-ignore
                  t("projectReadinessTools.digitalSealValidator.help.description", {
                    defaultValue:
                      "A digital seal confirms the identity of the professional who signed the document and ensures the document hasn't been altered.",
                  } as any) as any as string
                }
              </Text>
              <Text fontWeight="bold" mb={1}>
                {
                  // @ts-ignore
                  t("projectReadinessTools.digitalSealValidator.help.pass", {
                    defaultValue: "PASS/VERIFIED",
                  } as any) as any as string
                }
              </Text>
              <Text mb={3}>
                {
                  // @ts-ignore
                  t("projectReadinessTools.digitalSealValidator.help.passDesc", {
                    defaultValue: "This confirms the digital signature is valid and authentic.",
                  } as any) as any as string
                }
              </Text>
              <Text fontWeight="bold" mb={1}>
                {
                  // @ts-ignore
                  t("projectReadinessTools.digitalSealValidator.help.fail", {
                    defaultValue: "FAIL/UNABLE TO VERIFY",
                  } as any) as any as string
                }
              </Text>
              <Text>
                {
                  // @ts-ignore
                  t("projectReadinessTools.digitalSealValidator.help.failDesc", {
                    defaultValue:
                      "We couldn't verify the signature. This could be due to a revoked certificate, an altered document, or an unknown signer.",
                  }) as string
                }
              </Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      </HStack>
      <Text fontSize="lg" color="text.primary" mb="8">
        {t("projectReadinessTools.digitalSealValidator.description") as string}
      </Text>

      <Heading as="h2" size="md" mb="4">
        {t("projectReadinessTools.digitalSealValidator.fileRequirementsTitle") as string}
      </Heading>
      <UnorderedList spacing={2} mb="8" pl="4">
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement1") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement2") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement3") as string}</ListItem>
        <ListItem>{t("projectReadinessTools.digitalSealValidator.requirement4") as string}</ListItem>
      </UnorderedList>

      <VStack spacing={6} align="stretch" maxW="full">
        {result && (
          <Box bg="blue.50" borderLeft="4px solid" borderColor="blue.500" p={4} borderRadius="sm">
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
                <Heading as="h3" size="sm" mb={4} fontWeight="bold">
                  {t("projectReadinessTools.digitalSealValidator.digitalSignaturesDetected") as string}
                </Heading>
                <Box mb={4}>
                  <HStack spacing={2} align="center">
                    <Box as="span" fontSize="xl" color="gray.600">
                      •
                    </Box>
                    <Text fontWeight="bold">{file?.name}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600" pl={6}>
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
                <List spacing={4}>
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
                                color={isValid ? "green.500" : "red.500"}
                                m={0}
                              />
                              <Text>{signerName}</Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.600" pl={6}>
                              {t("projectReadinessTools.digitalSealValidator.signedAt") as string} {date}
                            </Text>
                            {!isValid && (
                              <Text fontSize="sm" color="red.500" pl={6}>
                                {sig.result}
                              </Text>
                            )}
                          </VStack>
                        </ListItem>
                      )
                    })}
                </List>
                <Button variant="outline" mt={6} onClick={resetValidator}>
                  {
                    // @ts-ignore
                    t("projectReadinessTools.digitalSealValidator.tryAnotherFile", {
                      defaultValue: "Try another file",
                    }) as string
                  }
                </Button>
              </Box>
            )}
          </Box>
        )}

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
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
            ".uppy-Dashboard-inner": {
              border: "none",
              borderRadius: "var(--chakra-radii-lg)",
              backgroundColor: "var(--chakra-colors-theme-blueLight)",
              width: "100%",
              height: "100%",
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
            ".uppy-StatusBar.is-error .uppy-StatusBar-statusPrimary": {
              display: "none",
            },
            ".uppy-StatusBar.is-error .uppy-StatusBar-statusSecondary": {
              display: "none",
            },
            ".uppy-StatusBar-actionBtn--retry": {
              display: "none",
            },
          }}
        >
          <Dashboard uppy={uppy} width="100%" height={276} proudlyDisplayPoweredByUppy={false} />
        </Box>
      </VStack>
    </Container>
  )
})
