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
import { IOptionalElectiveFieldInfo } from "../../../types/types"
import { SafeTipTapDisplay } from "../editor/safe-tiptap-display"

interface IOptionalElectivesModalProps {
  isOpen: boolean
  onClose: () => void
  data: {
    blockTitle?: string
    labels?: string[]
    electives?: IOptionalElectiveFieldInfo[]
  } | null
}

export const OptionalElectivesModal = ({ isOpen, onClose, data }: IOptionalElectivesModalProps) => {
  const { t } = useTranslation()

  const formatDescriptionHtml = (description: string) => description.replace(/\r\n/g, "\n").replace(/\n/g, "<br />")
  const electives: IOptionalElectiveFieldInfo[] = React.useMemo(() => {
    if (data?.electives?.length) return data.electives
    if (data?.labels?.length) return data.labels.map((label) => ({ label }))
    return []
  }, [data])

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{data?.blockTitle || "Optional electives"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
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
            <Text>{t("earlyAccessRequirementTemplate.noOptionalElectives")}</Text>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
