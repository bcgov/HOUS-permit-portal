import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { IContact, IOption } from "../../../types/types"
import { ContactSelect } from "../select/selectors/contact-select"

export interface IContactModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  permitApplication?: IPermitApplication
  autofillContactKey?: string
  onContactChange?: (option: IOption<IContact>) => void
  submissionState: any
}

export const ContactModal: React.FC<IContactModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  permitApplication,
  autofillContactKey,
  onContactChange,
  submissionState,
}) => {
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState<IOption<IContact>>(null)

  const onChange = (option) => {
    setSelectedOption(option)
    if (onContactChange) {
      onContactChange(option)
    } else if (autofillContactKey && permitApplication) {
      const { updateContactInSubmissionSection, updateContactInSubmissionDatagrid } = permitApplication
      const parts = autofillContactKey.split("|")
      const position = parts.slice(-1)[0]

      if (position === "in_section") {
        const requirementKey = parts.slice(0, -1).join("|")
        updateContactInSubmissionSection(requirementKey, option.value, submissionState)
      } else {
        const requirementPrefix = parts.slice(0, -1).join("|")
        const index = parseInt(position)
        updateContactInSubmissionDatagrid(requirementPrefix, index, option.value, submissionState)
      }
    }

    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="2xl">
      <ModalOverlay />

      <ModalContent mt={48}>
        <ModalHeader>
          <ModalCloseButton fontSize="11px" />
        </ModalHeader>
        <ModalBody py={6}>
          <Flex w="full" gap={2}>
            <ContactSelect onChange={onChange} selectedOption={selectedOption} />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
