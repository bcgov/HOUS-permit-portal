import {
  Box,
  Button,
  Container,
  HStack,
  Heading,
  Link,
  List,
  ListIcon,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CheckCircle } from "@phosphor-icons/react"
import type { UppyFile } from "@uppy/core"
import * as R from "ramda"
import React, { useRef, useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import useUppyTransient from "../../../hooks/use-uppy-transient"
import {
  DIGITAL_SEAL_VALIDATOR_UPLOAD_ENDPOINT,
  formatDigitalSealDateTime,
  parseDigitalSealSignature,
  parseUploadResponseToActionResult,
  type DigitalSealSignerDisplay,
  type DigitalSealValidatorActionResult,
} from "../../../utils/digital-seal-validation"
import { UppyDashboard } from "../../shared/uppy-dashboard"

export const CheckDigitalSealsScreen = () => {
  const { t } = useTranslation()
  const uppyRef = useRef<ReturnType<typeof useUppyTransient> | null>(null)

  const [validationResult, setValidationResult] = useState<DigitalSealValidatorActionResult | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileLastModified, setFileLastModified] = useState<number | null>(null)

  const hasResolvedResult = validationResult != null
  const uniqueSigners: DigitalSealSignerDisplay[] =
    validationResult?.status === "found"
      ? R.uniqBy(
          (signer) => signer.subjectName,
          validationResult.signatures.map((signature) => parseDigitalSealSignature(signature))
        )
      : []
  const formattedLastModified = fileLastModified ? formatDigitalSealDateTime(fileLastModified) : ""

  const applyUploadComplete = (uppyFile: UppyFile<{}, {}>, response: unknown) => {
    const fileData = uppyFile.data as File
    setFileName(uppyFile.name)
    setFileLastModified(fileData?.lastModified ?? null)
    setValidationResult(parseUploadResponseToActionResult(response))
  }

  const applyUploadError = (uppyFile: UppyFile<{}, {}>) => {
    const fileData = uppyFile.data as File
    setFileName(uppyFile.name)
    setFileLastModified(fileData?.lastModified ?? null)
    setValidationResult({ status: "systemFailure" })
  }

  const clearValidation = () => setValidationResult(null)

  const clearFile = () => {
    setFileName(null)
    setFileLastModified(null)
  }

  const resetValidator = () => {
    uppyRef.current?.cancelAll()
    clearValidation()
    clearFile()
  }

  const uppy = useUppyTransient({
    endpoint: DIGITAL_SEAL_VALIDATOR_UPLOAD_ENDPOINT,
    onUploadSuccess: applyUploadComplete,
    onUploadError: applyUploadError,
    onFileAdded: clearValidation,
    onFileRemoved: clearFile,
    onUploadStart: clearValidation,
    allowedFileTypes: [".pdf"],
    maxNumberOfFiles: 1,
    autoProceed: true,
  })
  uppyRef.current = uppy

  const formatSignerLabel = (signer: DigitalSealSignerDisplay) => {
    if (!signer.name && !signer.organization) {
      return signer.subjectName || (t("projectReadinessTools.digitalSealValidator.unknownSigner") as string)
    }
    if (signer.organization) {
      return `${signer.name} (${signer.organization})`
    }
    return signer.name
  }

  const resultCardColorProps =
    validationResult?.status !== "found"
      ? {
          bg: "semantic.warningLight",
          borderColor: "semantic.warning",
        }
      : {
          bg: "semantic.infoLight",
          borderColor: "theme.blueActive",
        }

  const contactEmail = t("site.contactEmail")
  const systemFailureBody = (
    <Trans
      i18nKey="projectReadinessTools.digitalSealValidator.systemFailureMessage"
      values={{ email: contactEmail }}
      components={{
        1: <Link href={`mailto:${contactEmail}`} color="text.link" textDecoration="underline" />,
      }}
    />
  )

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

      <VStack spacing={5} align="stretch" maxW="full">
        {hasResolvedResult && (
          <Box borderLeft="8px solid" py={8} pr={8} pl={6} borderRadius="sm" {...resultCardColorProps}>
            {validationResult.status !== "found" ? (
              <Box>
                <Heading as="h2" fontSize="2xl" mb={2} fontWeight="bold">
                  {validationResult.status === "notFound"
                    ? (t("projectReadinessTools.digitalSealValidator.notFoundTitle") as string)
                    : (t("projectReadinessTools.digitalSealValidator.systemFailureTitle") as string)}
                </Heading>
                <Text fontSize="lg" color="text.primary" mb={2}>
                  {t("projectReadinessTools.digitalSealValidator.fileLabel") as string} {fileName}
                </Text>
                {validationResult.status === "notFound" ? (
                  <Text fontSize="lg" color="text.primary">
                    {t("projectReadinessTools.digitalSealValidator.noSignaturesFound") as string}
                  </Text>
                ) : (
                  <Text fontSize="lg" color="text.primary">
                    {systemFailureBody}
                  </Text>
                )}
              </Box>
            ) : (
              <Box>
                <Heading as="h2" fontSize="2xl" mb={2} fontWeight="bold">
                  {t("projectReadinessTools.digitalSealValidator.foundTitle") as string}
                </Heading>
                <Box mb={4}>
                  <HStack spacing={2} align="center">
                    <Text fontSize="lg">
                      {t("projectReadinessTools.digitalSealValidator.fileLabel") as string} {fileName}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="text.secondary">
                    {t("projectReadinessTools.digitalSealValidator.lastModified") as string} {formattedLastModified}
                  </Text>
                </Box>
                <List fontSize="lg" spacing={4} pl={0}>
                  {uniqueSigners.map((signer, index) => {
                    const signedAtLabel = signer.signedAt
                      ? signer.signedAt
                      : (t("projectReadinessTools.digitalSealValidator.unknownDate") as string)

                    return (
                      <ListItem key={signer.subjectName || index}>
                        <VStack align="start" spacing={1}>
                          <HStack spacing={2}>
                            <ListIcon as={CheckCircle} color="theme.blueActive" m={0} />
                            <Text fontWeight="bold">{formatSignerLabel(signer)}</Text>
                          </HStack>
                          <Text fontSize="sm" color="text.secondary">
                            {t("projectReadinessTools.digitalSealValidator.signedAt") as string} {signedAtLabel}
                          </Text>
                        </VStack>
                      </ListItem>
                    )
                  })}
                </List>
              </Box>
            )}
          </Box>
        )}

        {hasResolvedResult && (
          <Box display="flex" justifyContent="flex-start" width="100%">
            <Button
              variant="link"
              fontSize="lg"
              onClick={resetValidator}
              color="text.link"
              textDecoration="none"
              fontWeight="normal"
              _hover={{ textDecoration: "none" }}
            >
              {t("projectReadinessTools.digitalSealValidator.checkAnotherDocument") as string}
            </Button>
          </Box>
        )}

        {!hasResolvedResult && (
          <Box
            position="relative"
            sx={{
              ".uppy-Dashboard": {
                border: "2px dashed var(--chakra-colors-border-light)",
                borderRadius: "var(--chakra-radii-lg)",
                borderColor: "var(--chakra-colors-theme-blue)",
                width: "100%",
                height: "100%",
              },
              ".uppy-Container": {
                display: hasResolvedResult ? "none" : "",
                height: "100%",
              },
              ".uppy-Dashboard-inner": {
                border: "none",
                borderRadius: "var(--chakra-radii-lg)",
                backgroundColor: "var(--chakra-colors-theme-blueLight)",
                width: "100%",
                height: "100%",
                display: hasResolvedResult ? "none" : "",
              },
              ".uppy-Dashboard-innerWrap": {
                display: hasResolvedResult ? "none" : "",
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
            <UppyDashboard uppy={uppy} width="100%" height={250} />
          </Box>
        )}
      </VStack>
    </Container>
  )
}
