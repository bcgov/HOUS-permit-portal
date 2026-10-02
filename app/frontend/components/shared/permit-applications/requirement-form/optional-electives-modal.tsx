import {
  Box,
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
import { IOptionalElectiveFieldInfo } from "../../../../types/types"
import { TOptionalElectivesPanel } from "../../../../utils/view-optional-electives"
import { SafeTipTapDisplay } from "../../editor/safe-tiptap-display"

interface IOptionalElectivesModalProps {
  isOpen: boolean
  onClose: () => void
  data: TOptionalElectivesPanel | null
}

export const OptionalElectivesModal = ({ isOpen, onClose, data }: IOptionalElectivesModalProps) => {
  const { t } = useTranslation()

  const formatDescriptionHtml = (description: string) => description.replace(/\r\n/g, "\n").replace(/\n/g, "<br />")
  const electives: IOptionalElectiveFieldInfo[] = data?.electives?.length
    ? data.electives
    : (data?.labels ?? []).map((label) => ({ label }))

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{data?.blockTitle || t("templateVersionPreview.optionalElectivesTitle")}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6} overflowY="auto" maxH="50vh">
          {electives.length ? (
            <UnorderedList spacing={4}>
              {electives.map((elective) => (
                <ListItem key={elective.label}>
                  <Text fontWeight="semibold" whiteSpace="pre-line">
                    {elective.label}
                  </Text>

                  {elective.tooltip ? (
                    <Text mt={1} fontSize="sm" color="gray.600" whiteSpace="pre-line">
                      {elective.tooltip}
                    </Text>
                  ) : null}

                  {elective.description ? (
                    <Box mt={2}>
                      <SafeTipTapDisplay
                        fontSize="sm"
                        color="gray.700"
                        htmlContent={formatDescriptionHtml(elective.description)}
                      />
                    </Box>
                  ) : null}
                </ListItem>
              ))}
            </UnorderedList>
          ) : (
            <Text>{t("templateVersionPreview.noOptionalElectives")}</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
