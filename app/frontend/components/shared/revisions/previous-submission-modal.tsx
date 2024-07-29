import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
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
        <ModalBody py={6}>
          <SingleRequirementForm requirementJson={requirementJson} submissionJson={submissionJson} />
          <ModalFooter>
            <Flex width="full" justify="center" gap={4}>
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
