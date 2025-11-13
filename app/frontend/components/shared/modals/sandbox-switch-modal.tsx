import {
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { EFlashMessageStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { CustomMessageBox } from "../base/custom-message-box"
import { SandboxSelect } from "../select/selectors/sandbox-select"

interface ISandboxSwitchModalProps {
  isOpen: boolean
  onClose: () => void
  isSandboxActive: boolean
  sandboxOptions: IOption[]
  selectedOption: string | undefined
  onSelectedOptionChange: (value: string) => void
  onConfirm: () => void
}

export const SandboxSwitchModal = ({
  isOpen,
  onClose,
  isSandboxActive,
  sandboxOptions,
  selectedOption,
  onSelectedOptionChange,
  onConfirm,
}: ISandboxSwitchModalProps) => {
  const { t } = useTranslation()
  const modalTitle: string = isSandboxActive ? t("sandbox.switch.leaveTitle") : t("sandbox.switch.title")

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent p={6}>
        <ModalHeader>{modalTitle}</ModalHeader>
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
              <SandboxSelect onChange={onSelectedOptionChange} value={selectedOption} options={sandboxOptions} />
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
            <Button onClick={onConfirm} variant="primary">
              {isSandboxActive ? t("sandbox.switch.leave") : t("sandbox.switch.continue")}
            </Button>
            <Button onClick={onClose} variant="secondary">
              {t("ui.neverMind")}
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
