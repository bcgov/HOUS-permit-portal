import { Flex, Modal, ModalBody, ModalContent, ModalOverlay, useDisclosure } from "@chakra-ui/react"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { IContact, IOption } from "../../../types/types"
import { ContactSelect } from "../select/selectors/contact-select"

export interface IContactModalProps extends ReturnType<typeof useDisclosure> {
  permitApplication: IPermitApplication
}

export const ContactModal = ({ isOpen, onOpen, onClose, permitApplication, autofillContactKey }) => {
  const { t } = useTranslation()
  const { updateContactInSubmissionSection, updateContactInSubmissionDatagrid } = permitApplication

  const [selectedOption, setSelectedOption] = useState<IOption<IContact>>(null)

  const onChange = (option) => {
    setSelectedOption(option)

    const parts = autofillContactKey.split("|")
    const position = parts.slice(-1)[0]

    if (position === "in_section") {
      const requirementKey = parts.slice(0, -1).join("|")
      updateContactInSubmissionSection(requirementKey, option.value)
    } else {
      const requirementPrefix = parts.slice(0, -1).join("|")
      const index = parseInt(position)
      updateContactInSubmissionDatagrid(requirementPrefix, index, option.value)
    }
    onClose()
  }

  return (
    <Modal onClose={onClose} isOpen={isOpen} size="xl">
      <ModalOverlay />

      <ModalContent>
        <ModalBody py={6}>
          <Flex w="full" gap={2}>
            <ContactSelect onChange={onChange} selectedOption={selectedOption} />
          </Flex>
          <Flex w="full" gap={2}></Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
