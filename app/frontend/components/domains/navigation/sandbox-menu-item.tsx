import {
  Button,
  Flex,
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
  useDisclosure,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { SandboxSelect } from "../../shared/select/selectors/sandbox-select"

export const SandboxMenuItem: React.FC = observer(() => {
  const { t } = useTranslation()
  const { sandboxStore, userStore } = useMst()
  const { currentUser } = userStore
  const { sandboxOptions } = currentUser.jurisdiction
  const { currentSandboxId, setCurrentSandboxId, clearSandboxId, isSandboxActive } = sandboxStore

  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedOption, setSelectedOption] = useState(sandboxOptions[0]?.value)

  const navigate = useNavigate()

  // Handler for toggling the switch
  const handleToggle = () => {
    onOpen() // Open modal in both cases
  }

  // Handler for confirming turning on the switch
  const handleConfirm = () => {
    if (isSandboxActive) {
      clearSandboxId() // Turn off sandbox mode
    } else {
      setCurrentSandboxId(selectedOption) // Turn on sandbox mode
    }
    onClose()
    navigate(0)
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
          <ModalHeader>{isSandboxActive ? t("sandbox.switch.leaveTitle") : t("sandbox.switch.title")}</ModalHeader>
          <ModalBody>
            {isSandboxActive ? (
              // Content for leaving sandbox mode
              <CustomMessageBox
                p={4}
                status={EFlashMessageStatus.special}
                title={t(`sandbox.switch.warningTitle`)}
                description={t(`sandbox.switch.leaveWarning`)}
              />
            ) : (
              // Content for entering sandbox mode
              <>
                <Text my={4}>{t("sandbox.switch.descriptionParagraph1")}</Text>
                <Text my={4}>{t("sandbox.switch.descriptionParagraph2")}</Text>
                <Text fontWeight="bold" mt={4} mb={2}>
                  {t("ui.chooseSandboxMode")}
                </Text>
                <SandboxSelect
                  onChange={setSelectedOption}
                  value={selectedOption}
                  options={sandboxOptions}
                  children={""}
                />
                <CustomMessageBox
                  mt={6}
                  p={4}
                  status={EFlashMessageStatus.special}
                  title={t(`sandbox.switch.warningTitle`)}
                  description={t(`sandbox.switch.warning`)}
                />
              </>
            )}
          </ModalBody>
          <ModalFooter mt={4}>
            <Flex w="full" gap={4}>
              <Button onClick={handleConfirm} variant="primary">
                {isSandboxActive ? t("sandbox.switch.leave") : t("sandbox.switch.continue")}
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
