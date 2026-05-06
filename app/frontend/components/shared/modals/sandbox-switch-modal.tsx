import { Radio, RadioGroup } from "@/components/ui/radio"
import { Box, Button, Dialog, Portal, Stack, Text } from "@chakra-ui/react"
import React, { useEffect, useMemo, useRef } from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus, ETemplateVersionStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { CustomMessageBox } from "../base/custom-message-box"

interface ISandboxSwitchModalProps {
  isOpen?: boolean
  open?: boolean
  onClose: () => void
  isSandboxActive: boolean
  sandboxOptions: IOption[]
  selectedOption: string | undefined
  onSelectedOptionChange: (value: string) => void
  onConfirm: () => void
}

export const SandboxSwitchModal = ({
  isOpen,
  open,
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

  const modalOpen = open ?? isOpen ?? false

  // Find published sandbox and default to it when modal first opens
  useEffect(() => {
    if (modalOpen && !isSandboxActive && publishedSandbox && !hasInitializedRef.current) {
      onSelectedOptionChange(publishedSandbox.id)
      hasInitializedRef.current = true
    }
    // Reset initialization flag when modal closes
    if (!modalOpen) {
      hasInitializedRef.current = false
    }
  }, [modalOpen, isSandboxActive, publishedSandbox, onSelectedOptionChange])

  return (
    <Dialog.Root
      open={modalOpen}
      size="xl"
      onOpenChange={(e) => {
        if (!e.open) {
          onClose()
        }
      }}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content p={6}>
            <Dialog.Header>{modalTitle}</Dialog.Header>
            <Dialog.Body>
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
                  <Text fontWeight="bold" mt={6} mb={3}>
                    {t("sandbox.switch.chooseWhichFormsToPreview")}
                  </Text>
                  <RadioGroup.Root value={selectedOption ?? ""} onValueChange={onSelectedOptionChange}>
                    <Stack gap={4}>
                      {publishedSandbox && (
                        <Radio value={publishedSandbox.id} size="lg" alignItems="flex-start">
                          <Box mt={-1}>
                            <Text fontWeight="bold">{t("sandbox.switch.publishedForms")}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {t("sandbox.switch.publishedFormsDescription")}
                            </Text>
                          </Box>
                        </Radio>
                      )}
                      {scheduledSandbox && (
                        <Radio value={scheduledSandbox.id} size="lg" alignItems="flex-start">
                          <Box mt={-1}>
                            <Text fontWeight="bold">{t("sandbox.switch.scheduledForms")}</Text>
                            <Text fontSize="sm" color="gray.600">
                              {t("sandbox.switch.scheduledFormsDescription")}
                            </Text>
                          </Box>
                        </Radio>
                      )}
                    </Stack>
                  </RadioGroup.Root>
                  <CustomMessageBox
                    mt={6}
                    p={4}
                    status={EFlashMessageStatus.special}
                    title={t(`sandbox.switch.warningTitle`)}
                    description={t(`sandbox.switch.warning`)}
                  />
                </>
              )}
            </Dialog.Body>
            <Dialog.Footer mt={4}>
              <Flex w="full" gap={4}>
                <Button onClick={onConfirm} variant="primary">
                  {isSandboxActive ? t("sandbox.switch.leave") : t("sandbox.switch.continue")}
                </Button>
                <Button onClick={onClose} variant="secondary">
                  {t("ui.neverMind")}
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}
