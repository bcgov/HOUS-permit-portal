import {
  Button,
  Flex,
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
import { Download, FileArrowDown, FileZip } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { useMst } from "../../../setup/root"
import { formatBytes } from "../../../utils/utility-functions"
import { SharedSpinner } from "../../shared/base/shared-spinner"
export interface ISubmissionDownloadModalProps {
  permitApplication: IPermitApplication
  renderTrigger?: (onOpen: () => void) => React.ReactNode
}

export const SubmissionDownloadModal = observer(
  ({ permitApplication, renderTrigger }: ISubmissionDownloadModalProps) => {
    const { t } = useTranslation()
    const { permitApplicationStore } = useMst()
    const { supportingDocuments, zipfileUrl, zipfileName, stepCode } = permitApplication
    const checklist = stepCode?.preConstructionChecklist

    const { isOpen, onOpen, onClose } = useDisclosure()

    useEffect(() => {
      if (!isOpen) return

      if (!permitApplication?.isFullyLoaded) {
        permitApplicationStore.fetchPermitApplication(permitApplication?.id)
      }
    }, [permitApplication?.isFullyLoaded, isOpen])

    useEffect(() => {
      const fetch = async () => await checklist.load()
      checklist && !checklist.isLoaded && fetch()
    }, [checklist?.isLoaded])

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
          <ModalContent>
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
                      flex={1}
                      href={zipfileUrl}
                      download={zipfileName}
                      textDecoration="none"
                      leftIcon={<FileZip />}
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

const FileDownloadLink = function ApplicationFileDownloadLink({ url, name, size }) {
  return (
    <Flex w="full" align="center" justify="space-between">
      <Button as={Link} href={url} download={name} variant="link" leftIcon={<FileArrowDown size={16} />}>
        {name}
      </Button>
      <Text color="greys.grey01" textAlign="right" fontSize="xs">
        {formatBytes(size)}
      </Text>
    </Flex>
  )
}
