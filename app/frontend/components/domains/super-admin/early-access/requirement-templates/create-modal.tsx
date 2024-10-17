import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"
import { CopyFromLiveModal } from "./copy-from-live-modal"

export const CreateModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  return (
    <>
      <Button variant="primary" onClick={onOpen} w={240}>
        {t("earlyAccessRequirementTemplate.new.title")}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t("earlyAccessRequirementTemplate.new.modalTitle")}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={4} my={8}>
              <Flex gap={4} my={8}>
                <GreyFlex>
                  <Text>{t("earlyAccessRequirementTemplate.new.startingFresh")}</Text>
                  <RouterLinkButton to="new" alignSelf="center" variant="primary">
                    {t("earlyAccessRequirementTemplate.new.startWithBlank")}
                  </RouterLinkButton>
                </GreyFlex>
                <GreyFlex>
                  <Text>{t("earlyAccessRequirementTemplate.new.addFromExisitng")}</Text>
                  <CopyFromLiveModal />
                </GreyFlex>
              </Flex>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

const GreyFlex: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Flex
    justify="space-between"
    direction="column"
    gap={4}
    p={4}
    bg="greys.grey03"
    border="1px solid"
    borderColor="border.light"
  >
    {children}
  </Flex>
)
