import {
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface IOptionalElectivesModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    blockTitle?: string
    labels: string[]
  } | null
}

export const OptionalElectivesModal = ({ isOpen, onClose, data }: IOptionalElectivesModalProps) => {
  const { t } = useTranslation()

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{data?.blockTitle || "Optional electives"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          {data?.labels?.length ? (
            <UnorderedList spacing={2}>
              {data.labels.map((label) => (
                <ListItem key={label}>
                  <Text whiteSpace="pre-line">{label}</Text>
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>{t("earlyAccessRequirementTemplate.noOptionalElectives")}</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
