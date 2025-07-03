import {
  Box,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IPermitCollaboration } from "../../../models/permit-collaboration"

interface IProps {
  isOpen: boolean
  onClose: () => void
  designatedReviewer?: IPermitCollaboration
}

export const DesignatedReviewerModal = observer(({ isOpen, onClose, designatedReviewer }: IProps) => {
  const { t } = useTranslation()
  const user = designatedReviewer?.collaborator?.user
  const name = user?.name
  const organization = user?.organization

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex align="center" gap={4}>
            {t("permitApplication.show.revision.designatedReviewerModal.title")}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>{t("permitApplication.show.revision.designatedReviewerModal.body")}</Text>
          <Box borderWidth={1} borderColor="border.light" borderRadius="sm" p={4} mt={6}>
            <Text fontSize="sm" color="text.secondary" textTransform="uppercase">
              {t("permitApplication.show.revision.designatedReviewerModal.designatedReviewer")}
            </Text>
            <Text fontWeight="bold" fontSize="lg" mt={1}>
              {name}
            </Text>
            {organization && <Text color="text.secondary">{`{${organization}}`}</Text>}
          </Box>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={onClose}>
            {t("ui.okay")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
})
