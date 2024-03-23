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
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react"
import { Download, FilePdf, FileZip } from "@phosphor-icons/react"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { formatBytes } from "../../../utils/utility-functions"
import { PDFContent } from "../../shared/permit-applications/pdf-content"

export interface ISubmissionDownloadModalProps {
  permitApplication: IPermitApplication
  renderTrigger?: (onOpen: () => void) => React.ReactNode
}

export const SubmissionDownloadModal = observer(
  ({ permitApplication, renderTrigger }: ISubmissionDownloadModalProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { supportingDocuments, zipfileUrl, zipfileName } = permitApplication

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
      if (!permitApplication.isFullyLoaded) {
        permitApplicationStore.fetchPermitApplication(permitApplication.id)
      }
    }, [permitApplication.isFullyLoaded])

    return (
      <>
        {renderTrigger ? (
          renderTrigger(onOpen)
        ) : (
          <Button variant="primary" onClick={onOpen} leftIcon={<Download />}>
            {t("permitApplication.show.downloadApplication")}
          </Button>
        )}

        <Modal onClose={onClose} isOpen={isOpen} size="xl" scrollBehavior="inside">
          <ModalOverlay />
          <ModalContent p={6}>
            <ModalHeader>
              <VStack w="full" align="start">
                <Heading as="h1" textTransform={"capitalize"}>
                  {t("permitApplication.show.downloadHeading")} {permitApplication.number}
                </Heading>
                <Text fontSize="md" fontWeight="normal">
                  {t("permitApplication.show.downloadPrompt")}
                </Text>
              </VStack>
              <ModalCloseButton fontSize="11px" />
            </ModalHeader>
            <ModalBody borderRadius="lg" borderWidth={1} borderColor="border.light" p={4}>
              <Flex direction="column" gap={6}>
                <VStack align="flex-start" w="full">
                  {supportingDocuments.map((doc) => (
                    <FileDownloadLink key={doc.fileUrl} url={doc.fileUrl} name={doc.fileName} size={doc.fileSize} />
                  ))}
                </VStack>
              </Flex>
            </ModalBody>
            <ModalFooter>
              <Flex gap={2} w="full" wrap="wrap">
                <Button
                  variant="primary"
                  as={Link}
                  w="full"
                  href={zipfileUrl}
                  download={zipfileName}
                  textDecoration="none"
                  leftIcon={<FileZip />}
                  _hover={{ textDecoration: "none" }}
                >
                  {t("permitApplication.show.downloadZip")}
                </Button>
                <PDFDownloadLink
                  document={permitApplication && <PDFContent permitApplication={permitApplication} />}
                  fileName="application.pdf"
                  style={{ width: "100%" }}
                >
                  {({ blob, url, loading, error }) => {
                    return (
                      <Button
                        isLoading={loading}
                        isDisabled={loading || !!error}
                        variant="primary"
                        w="full"
                        leftIcon={<FilePdf />}
                      >
                        {t("permitApplication.show.downloadForm")}
                      </Button>
                    )
                  }}
                </PDFDownloadLink>
                <Button variant="secondary" w="full" onClick={onClose}>
                  {t("ui.neverMind")}
                </Button>
              </Flex>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  }
)

const FileDownloadLink = function ApplicationFileDownloadLink({ url, name, size }) {
  return (
    <Flex w="full" justify="space-between">
      <HStack color="text.link" w="75%">
        <Download />
        <Link href={url} download={name}>
          {name}
        </Link>
      </HStack>
      <Text color="greys.grey01" w="25%" textAlign="right">
        {formatBytes(size)}
      </Text>
    </Flex>
  )
}
