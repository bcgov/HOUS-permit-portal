import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { ISingleRequirementFormJson } from "../../../types/types"
import { SingleRequirementForm } from "../permit-applications/single-requirement-form"

export interface IPreviousSubmissionModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  requirementJson: ISingleRequirementFormJson
  submissionJson: any
}

export const PreviousSubmissionModal: React.FC<IPreviousSubmissionModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  requirementJson,
  submissionJson,
}) => {
  const { t } = useTranslation()

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader textAlign="center">
          <ModalCloseButton fontSize="11px" />
          <Heading as="h3" fontSize="xl">
            {t("permitApplication.show.revision.originallySubmitted")}
          </Heading>
        </ModalHeader>
        <ModalBody>
          <SingleRequirementForm requirementJson={requirementJson} submissionJson={submissionJson} />
          <ModalFooter>
            <Flex width="full" justify="center">
              <Button variant="secondary" onClick={onClose}>
                {t("ui.ok")}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
