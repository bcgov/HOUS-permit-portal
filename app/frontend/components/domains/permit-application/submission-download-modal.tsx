import {
  Button,
  Flex,
  HStack,
  Heading,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Download, FileArrowDown, FileZip, Gear } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { datefnsAppDateFormat } from "../../../constants"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { formatBytes } from "../../../utils/utility-functions"
import { SharedSpinner } from "../../shared/base/shared-spinner"
import { LoadingIcon } from "../../shared/loading-icon"

export interface ISubmissionDownloadModalProps {
  permitApplication: IPermitApplication
  renderTrigger?: (onOpen: () => void) => React.ReactNode
  review?: boolean
}

export const SubmissionDownloadModal = observer(
  ({ permitApplication, renderTrigger, review }: ISubmissionDownloadModalProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { allSubmissionVersionCompletedSupportingDocuments, zipfileUrl, zipfileName, stepCode } = permitApplication
    const checklist = stepCode?.preConstructionChecklist

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
      if (!isOpen) return

      if (!permitApplication?.isFullyLoaded) {
        permitApplicationStore.fetchPermitApplication(permitApplication?.id, review)
      }
    }, [permitApplication?.isFullyLoaded, isOpen])

    useEffect(() => {
      const fetch = async () => await checklist.load()
      checklist && !checklist.isLoaded && fetch()
    }, [checklist?.isLoaded])

    useEffect(() => {
      if (!permitApplication?.isFullyLoaded) {
        return
      }

      if (!permitApplication.isSubmitted || !permitApplication.missingPdfs.length) {
        return
      }

      permitApplication.generateMissingPdfs()
    }, [permitApplication?.isFullyLoaded, permitApplication?.missingPdfs, checklist?.isLoaded])

    return (
      <>
        {renderTrigger ? (
          renderTrigger(onOpen)
        ) : (
          <Button variant="primary" onClick={onOpen} leftIcon={<Download />}>
            {t("permitApplication.show.downloadApplication")}
          </Button>
        )}

        <Modal onClose={onClose} isOpen={isOpen} size="md" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent maxW={"container.md"}>
            {!permitApplication?.isFullyLoaded ? (
              <SharedSpinner />
            ) : (
              <>
                <ModalHeader>
                  <VStack w="full" align="start">
                    <Heading as="h1" fontSize="2xl" textTransform={"capitalize"}>
                      {t("permitApplication.show.downloadHeading")}
                      <br />
                      <Text as="span" fontSize="lg" color="text.secondary">
                        {permitApplication.number}
                      </Text>
                    </Heading>
                    <Text fontSize="md" fontWeight="normal">
                      {t("permitApplication.show.downloadPrompt")}
                    </Text>
                  </VStack>
                  <ModalCloseButton fontSize="11px" />
                </ModalHeader>
                <ModalBody>
                  <Flex direction="column" gap={3} borderRadius="lg" borderWidth={1} borderColor="border.light" p={4}>
                    <VStack align="flex-start" w="full" spacing={3}>
                      {permitApplication.missingPdfs.map((pdfKey) => (
                        <MissingPdf key={pdfKey} pdfKey={pdfKey} />
                      ))}
                      {allSubmissionVersionCompletedSupportingDocuments.map((doc) => (
                        <FileDownloadLink
                          key={doc.fileUrl}
                          url={doc.fileUrl}
                          name={doc.fileName}
                          size={doc.fileSize}
                          createdAt={doc.createdAt}
                        />
                      ))}
                    </VStack>
                  </Flex>
                </ModalBody>
                <ModalFooter>
                  <Flex gap={2} w="full" wrap="wrap">
                    <Button
                      variant="primary"
                      as={Link}
                      flex={1}
                      href={zipfileUrl}
                      download={zipfileName}
                      textDecoration="none"
                      leftIcon={<FileZip />}
                      isDisabled={!zipfileUrl}
                      _hover={{ textDecoration: "none" }}
                    >
                      {t("permitApplication.show.downloadZip")}
                    </Button>
                    <Button variant="secondary" onClick={onClose}>
                      {t("ui.neverMind")}
                    </Button>
                  </Flex>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </>
    )
  }
)

const FileDownloadLink = function ApplicationFileDownloadLink({ url, name, size, createdAt }) {
  return (
    <HStack w="full" align="center">
      <Stack flex={1} spacing={2}>
        <Button
          as={Link}
          href={url}
          download={name}
          variant="link"
          leftIcon={<FileArrowDown size={16} />}
          whiteSpace="normal"
        >
          {name}
        </Button>
        <Text color="greys.grey01" fontSize="xs" ml={8}>
          {formatBytes(size)}
        </Text>
      </Stack>

      <Text color="greys.grey01" textAlign="right" fontSize="xs">
        {format(createdAt, datefnsAppDateFormat)}
      </Text>
    </HStack>
  )
}

function MissingPdf({ pdfKey }: { pdfKey: "permit_application_pdf" }) {
  const { t } = useTranslation()

  const getMissingPdfLabel = () => {
    if (pdfKey.startsWith("permit_application_pdf")) {
      return t("permitApplication.show.missingPdfLabels.permitApplication")
    }

    if (pdfKey.startsWith("step_code_checklist_pdf")) {
      return t("permitApplication.show.missingPdfLabels.stepCode")
    }
  }
  return (
    <Flex w="full" align="center" justify="space-between" pl={1}>
      <HStack spacing={3}>
        <FileArrowDown size={16} />
        <Text as={"span"} color={"semantic.error"}>
          {t("permitApplication.show.fetchingMissingPdf", { missingPdf: getMissingPdfLabel() || pdfKey })}
        </Text>
      </HStack>

      <LoadingIcon icon={<Gear />} />
    </Flex>
  )
}
