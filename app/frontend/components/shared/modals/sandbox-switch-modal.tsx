import {
  Button,
  Checkbox,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react"
import React, { useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, ETemplateVersionStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { CustomMessageBox } from "../base/custom-message-box"

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
  const { userStore } = useMst()
  const { currentUser } = userStore
  const modalTitle: string = isSandboxActive ? t("sandbox.switch.leaveTitle") : t("sandbox.switch.title")
  const hasInitializedRef = useRef(false)

  // Find published and scheduled sandboxes
  const publishedSandbox = useMemo(
    () =>
      currentUser.jurisdiction?.sandboxes.find(
        (s) => s.templateVersionStatusScope === ETemplateVersionStatus.published
      ),
    [currentUser.jurisdiction]
  )
  const scheduledSandbox = useMemo(
    () =>
      currentUser.jurisdiction?.sandboxes.find(
        (s) => s.templateVersionStatusScope === ETemplateVersionStatus.scheduled
      ),
    [currentUser.jurisdiction]
  )

  // Determine if checkbox should be checked (true if scheduled is selected)
  const isTrainOnUpcomingChecked = selectedOption === scheduledSandbox?.id

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && scheduledSandbox) {
      onSelectedOptionChange(scheduledSandbox.id)
    } else if (publishedSandbox) {
      onSelectedOptionChange(publishedSandbox.id)
    }
  }

  // Find published sandbox and default to it when modal first opens
  useEffect(() => {
    if (isOpen && !isSandboxActive && publishedSandbox && !hasInitializedRef.current) {
      onSelectedOptionChange(publishedSandbox.id)
      hasInitializedRef.current = true
    }
    // Reset initialization flag when modal closes
    if (!isOpen) {
      hasInitializedRef.current = false
    }
  }, [isOpen, isSandboxActive, publishedSandbox, onSelectedOptionChange])

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

              <CustomMessageBox
                mt={6}
                p={4}
                status={EFlashMessageStatus.special}
                title={t(`sandbox.switch.warningTitle`)}
                description={t(`sandbox.switch.warning`)}
              />
              <Checkbox
                isChecked={isTrainOnUpcomingChecked}
                onChange={handleCheckboxChange}
                mt={4}
                mb={2}
                colorScheme="blue"
              >
                {t("sandbox.switch.trainOnUpcomingTemplates")}
              </Checkbox>
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
