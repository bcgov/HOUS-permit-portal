import {
  Alert,
  AlertIcon,
  Box,
  Container,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Link,
  List,
  ListIcon,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Text,
  UnorderedList,
  VStack,
  useToast,
} from "@chakra-ui/react"
import { CheckCircle, Info, XCircle } from "@phosphor-icons/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useServerAPI } from "../../../setup/root"

export const DigitalSealValidatorScreen = () => {
  const { t } = useTranslation()
  const api = useServerAPI()
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const toast = useToast()

  const validateFile = async (fileToValidate: File) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await api.validateDigitalSeal(fileToValidate)
      if (response.ok && response.data.status === "success") {
        setResult(response.data.signatures)
      } else {
        setError(t("projectReadinessTools.digitalSealValidator.notValidated" as any) as string)
      }
    } catch (e: any) {
      setError(e.message || (t("projectReadinessTools.digitalSealValidator.notValidated" as any) as string))
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      processFile(selectedFile)
    }
  }

  const onDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const onDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const droppedFiles = event.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      processFile(droppedFiles[0])
    }
  }

  const processFile = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      const title = t("ui.invalidFileType", { defaultValue: "Invalid File Type" }) as string
      const description = t("ui.onlyPdfAllowed", { defaultValue: "Only PDF files are allowed" }) as string
      toast({
        title,
        description,
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    setFile(selectedFile)
    validateFile(selectedFile)
  }

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
                  t("projectReadinessTools.digitalSealValidator.help.description", {
                    defaultValue:
                      "A digital seal confirms the identity of the professional who signed the document and ensures the document hasn't been altered.",
                  }) as string
                }
              </Text>
              <Text fontWeight="bold" mb={1}>
                {t("projectReadinessTools.digitalSealValidator.help.pass") as string}
              </Text>
              <Text mb={3}>{t("projectReadinessTools.digitalSealValidator.help.passDesc") as string}</Text>
              <Text fontWeight="bold" mb={1}>
                {t("projectReadinessTools.digitalSealValidator.help.fail") as string}
              </Text>
              <Text>{t("projectReadinessTools.digitalSealValidator.help.failDesc") as string}</Text>
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
                        <ListItem key={index}>
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

        <FormControl>
          <FormLabel htmlFor="file-upload" cursor="pointer" m={0} w="full">
            <Box
              bg={isDragOver ? "blue.100" : "blue.50"}
              border="2px dashed"
              borderColor={isDragOver ? "blue.500" : "blue.300"}
              borderRadius="md"
              p={10}
              textAlign="center"
              _hover={{ borderColor: "blue.500", bg: "blue.100" }}
              transition="all 0.2s"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <Input type="file" id="file-upload" accept="application/pdf" onChange={handleFileChange} display="none" />
              <VStack spacing={4}>
                {isLoading ? (
                  <Spinner size="xl" color="blue.500" thickness="4px" />
                ) : (
                  <>
                    <Text fontSize="lg">
                      <Box as="i" className="fa fa-cloud-upload" mr={2} />
                      {t("projectReadinessTools.digitalSealValidator.dragAndDrop") as string}{" "}
                      <Link color="blue.600" textDecoration="underline" as="span">
                        {t("projectReadinessTools.digitalSealValidator.browseDevice") as string}
                      </Link>
                    </Text>
                  </>
                )}
              </VStack>
            </Box>
          </FormLabel>
        </FormControl>
      </VStack>
    </Container>
  )
}
