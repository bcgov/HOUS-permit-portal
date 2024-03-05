import {
  Box,
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
import { Download } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { formatBytes } from "../../../utils/utility-functions"

export interface ISubmissionDownloadModalProps {
  permitApplication: IPermitApplication
  renderTrigger?: (onOpen: () => void) => React.ReactNode
}

export const SubmissionDownloadModal = ({ permitApplication, renderTrigger }: ISubmissionDownloadModalProps) => {
  const { t } = useTranslation()
  const { supportingDocuments, zipfileUrl, zipfileName } = permitApplication

  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      {renderTrigger ? (
        renderTrigger(onOpen)
      ) : (
        <Button variant="primary" onClick={onOpen} leftIcon={<Download />}>
          {t("permitApplication.show.downloadApplication")}
        </Button>
      )}

      <Modal onClose={onClose} isOpen={isOpen} size="lg">
        <ModalOverlay />
        <ModalContent p={6}>
          <ModalHeader>
            <Flex w="full" justify="space-between">
              <Heading as="h1" textTransform={"capitalize"}>
                {t("permitApplication.show.downloadHeading")} {permitApplication.number}
              </Heading>
            </Flex>
            <ModalCloseButton fontSize="11px" />
          </ModalHeader>
          <ModalBody>
            <Flex direction="column" gap={6}>
              <Text>{t("permitApplication.show.downloadPrompt")}</Text>
              <Box border="1px solid" borderRadius="lg" borderColor="border.light" p={4}>
                <VStack align="flex-start" w="full">
                  {supportingDocuments.map((doc) => (
                    <Flex w="full" justify="space-between" key={doc.fileUrl}>
                      <HStack color="text.link" w="75%">
                        <Download />
                        <Link href={doc.fileUrl} download={doc.fileName}>
                          {doc.fileName}
                        </Link>
                      </HStack>
                      <Text color="greys.grey01" w="25%" textAlign="right">
                        {formatBytes(doc.fileSize)}
                      </Text>
                    </Flex>
                  ))}
                </VStack>
              </Box>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Flex w="full" gap={4}>
              <Button
                variant="primary"
                as={Link}
                href={zipfileUrl}
                download={zipfileName}
                textDecoration="none"
                _hover={{ textDecoration: "none" }}
              >
                {t("permitApplication.show.downloadZip")}
              </Button>
              <Button variant="secondary" onClick={onClose}>
                {t("ui.neverMind")}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
