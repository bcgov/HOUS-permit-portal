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
import * as R from "ramda"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { IPermitApplication } from "../../../models/permit-application"
import { INPUT_CONTACT_KEYS } from "../../../stores/contact-store"
import { IContact, IOption } from "../../../types/types"
import { convertPhoneNumberToFormioFormat, isSafari } from "../../../utils/utility-functions"
import { ContactSelect } from "../select/selectors/contact-select"

export interface IContactModalProps extends Partial<ReturnType<typeof useDisclosure>> {
  permitApplication?: IPermitApplication
  autofillContactKey?: string
  onContactChange?: (option: IOption<IContact>) => void
  submissionState: any
  setSubmissionState: (any) => void
}

export const ContactModal: React.FC<IContactModalProps> = ({
  isOpen,
  onOpen,
  onClose,
  permitApplication,
  autofillContactKey,
  onContactChange,
  submissionState,
  setSubmissionState,
}) => {
  const { t } = useTranslation()

  const [selectedOption, setSelectedOption] = useState<IOption<IContact>>(null)

  const onChange = (option) => {
    setSelectedOption(option)
    if (onContactChange) {
      onContactChange(option)
    } else if (autofillContactKey && permitApplication) {
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
    }

    // Save the current scroll position. This is for a hack to fix odd
    // scroll to bottom behaviour on safari
    const scrollPosition = window.scrollY

    onClose()

    // Restore the scroll position after closing
    if (isSafari) {
      setTimeout(() => {
        window.scrollTo(0, scrollPosition)
      }, 100)
    }
  }

  const updateContactInSubmissionSection = (requirementKey: string, contact: IContact) => {
    const sectionKey = requirementKey.split("|")[0].slice(21, 64)
    const newSectionFields = {}
    INPUT_CONTACT_KEYS.forEach((contactField) => {
      let newValue = ["cell", "phone"].includes(contactField)
        ? // The normalized phone number starts with +1... (country code)
          convertPhoneNumberToFormioFormat(contact[contactField] as string)
        : contact[contactField] || ""
      newSectionFields[`${requirementKey}|${contactField}`] = newValue
    })

    const newData = {
      data: {
        ...submissionState.data,
        [sectionKey]: {
          ...submissionState.data[sectionKey],
          ...newSectionFields,
        },
      },
    }
    setSubmissionState(newData)
  }

  const updateContactInSubmissionDatagrid = (requirementPrefix: string, index: number, contact: IContact) => {
    const parts = requirementPrefix.split("|")
    const contactType = parts[parts.length - 1]
    const requirementKey = parts.slice(0, -1).join("|")
    const sectionKey = requirementKey.split("|")[0].slice(21, 64)

    const newContactElement = {}
    INPUT_CONTACT_KEYS.forEach((contactField) => {
      // The normalized phone number starts with +1... (country code)
      let newValue = ["cell", "phone"].includes(contactField)
        ? convertPhoneNumberToFormioFormat(contact[contactField] as string)
        : contact[contactField]
      newContactElement[`${requirementKey}|${contactType}|${contactField}`] = newValue
    })
    const clonedArray = R.clone(submissionState.data?.[sectionKey]?.[requirementKey] ?? [])
    clonedArray[index] = newContactElement
    const newSectionFields = {
      [requirementKey]: clonedArray,
    }
    const newData = {
      data: {
        ...submissionState.data,
        [sectionKey]: {
          ...submissionState.data[sectionKey],
          ...newSectionFields,
        },
      },
    }
    setSubmissionState(newData)
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
