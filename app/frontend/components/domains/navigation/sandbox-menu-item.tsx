import {
  Button,
  Flex,
  ListItem,
  MenuDivider,
  MenuItem,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Switch,
  Text,
  UnorderedList,
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

export const SandboxMenuItem: React.FC = observer(() => {
  const { t } = useTranslation()
  const { sandboxStore, userStore } = useMst()
  const { currentUser } = userStore
  const { sandboxOptions } = currentUser.jurisdiction
  const { currentSandboxId, setCurrentSandboxId, clearSandboxId, isSandboxActive } = sandboxStore

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedOption, setSelectedOption] = useState(sandboxOptions[0]?.value)

  // Handler for toggling the switch
  const handleToggle = () => {
    if (!isSandboxActive) {
      onOpen() // Open modal to confirm turning on
    } else {
      clearSandboxId() // Directly turn off
    }
  }

  // Handler for confirming turning on the switch
  const handleConfirm = () => {
    setCurrentSandboxId(selectedOption)
    onClose()
  }

  if (!currentUser.jurisdiction || R.isEmpty(sandboxOptions)) return <></>

  return (
    <>
      <MenuItem onClick={handleToggle} py={3}>
        <Flex justify="space-between" w="full">
          <Text>{t("sandbox.switch.label")}</Text>
          <Switch isChecked={isSandboxActive} pointerEvents="none" />
        </Flex>
      </MenuItem>
      <MenuDivider my={0} borderColor="border.light" />

      {/* Modal for confirmation */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent p={6}>
          <ModalHeader>{t("sandbox.switch.title")}</ModalHeader>
          <ModalBody>
            <Text>{t("sandbox.switch.description")}</Text>
            <UnorderedList mt={2}>
              {(t("sandbox.switch.descriptionList", { returnObjects: true }) as string[]).map((item, index) => (
                <ListItem key={index}>{item}</ListItem>
              ))}
            </UnorderedList>

            <Text mt={4}>{t("sandbox.switch.choicesAvailable")}</Text>
            <UnorderedList my={2}>
              <ListItem>
                <Trans i18nKey="sandbox.switch.publishedDescription" />
              </ListItem>
              <ListItem>
                <Trans i18nKey="sandbox.switch.scheduledDescription" />
              </ListItem>
            </UnorderedList>

            <Text fontWeight="bold" mt={4}>
              {t("ui.select")}
            </Text>
            <SandboxSelect onChange={setSelectedOption} value={selectedOption} options={sandboxOptions} />
          </ModalBody>
          <ModalFooter mt={4}>
            <Flex w="full" gap={4}>
              <Button onClick={handleConfirm} variant="primary">
                {t("sandbox.switch.continue")}
              </Button>
              <Button onClick={onClose} variant="secondary">
                {t("ui.neverMind")}
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
})
