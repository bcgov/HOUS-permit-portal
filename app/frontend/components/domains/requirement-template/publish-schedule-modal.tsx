import {
  Alert,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertIcon,
  Box,
  Button,
  ButtonProps,
  Center,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { format, isAfter, isSameDay } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useEffect, useMemo, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { IRequirementTemplateConfigError } from "../../../types/types"
import { DatePicker } from "../../shared/date-picker"
import { ConfigErrorsList } from "./config-errors-list"
import { TemplateAccessSidebar } from "./template-access-sidebar"
import { VersionNoteField, normalizedVersionNote } from "./version-note-field"

export type TPublishScheduleTranslationNamespace = "requirementTemplate.edit" | "templateVersionPreview.schedulePublish"

export interface IPublishScheduleModalProps {
  minDate?: Date
  onScheduleConfirm?: (date: Date, changeNotes?: string) => void
  onForcePublishNow?: (changeNotes?: string) => void
  triggerButtonProps?: Partial<ButtonProps>
  renderTrigger?: (onOpen: () => void) => React.ReactNode
  requirementTemplate?: IRequirementTemplate
  onSaveDraft?: () => void
  onSaveAndValidate?: () => Promise<IRequirementTemplateConfigError[]>
  /**
   * Sibling scheduled TVs for the template. When the picked date is on or before
   * any of these, the confirm flow will show an override dialog warning that
   * those earlier versions will be auto-unscheduled.
   */
  scheduledConflicts?: Array<{ id: string; versionDate: Date }>
  /** Which i18n namespace to read modal strings from. */
  translationNamespace?: TPublishScheduleTranslationNamespace
  /** Hides the "Manage access" secondary button (defaults to shown). */
  hideManageAccessButton?: boolean
  /** Override the primary trigger label (defaults to `ui.publish`). */
  triggerLabel?: string
}

// Preserved for backwards compatibility with the live-template edit screen.
export interface IEditRequirementTemplateScreenRenderActionProps extends Partial<IPublishScheduleModalProps> {}

export const PublishScheduleModal = observer(function PublishScheduleModal({
  minDate,
  onScheduleConfirm,
  triggerButtonProps,
  renderTrigger,
  onForcePublishNow,
  requirementTemplate,
  onSaveAndValidate,
  scheduledConflicts,
  translationNamespace = "requirementTemplate.edit",
  hideManageAccessButton,
  triggerLabel,
}: IPublishScheduleModalProps) {
  const { t: tStrict } = useTranslation()
  // i18next's strict key typing can't see through our dynamic translationNamespace.
  const t = tStrict as any
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAccessOpen, onOpen: onAccessOpen, onClose: onAccessClose } = useDisclosure()
  const overrideDialog = useDisclosure()
  const overrideCancelRef = useRef<HTMLButtonElement>(null)
  const [scheduleDate, setScheduleDate] = React.useState<Date | null>(null)
  const [versionNote, setVersionNote] = React.useState("")
  const [isValidating, setIsValidating] = React.useState(false)
  const [configErrors, setConfigErrors] = React.useState<IRequirementTemplateConfigError[]>([])
  const { uiStore } = useMst()

  const nk = (key: string) => `${translationNamespace}.${key}`
  const hasConfigErrors = configErrors.length > 0
  const actionsDisabled = isValidating || hasConfigErrors

  const conflictsOnOrBeforeSelected = useMemo(() => {
    if (!scheduleDate || !scheduledConflicts?.length) return []
    return scheduledConflicts.filter(
      (c) => isSameDay(c.versionDate, scheduleDate) || isAfter(scheduleDate, c.versionDate)
    )
  }, [scheduleDate, scheduledConflicts])

  const laterScheduled = useMemo(() => {
    if (!scheduleDate || !scheduledConflicts?.length) return []
    return scheduledConflicts.filter((c) => isAfter(c.versionDate, scheduleDate))
  }, [scheduleDate, scheduledConflicts])

  const onSchedule = () => {
    if (conflictsOnOrBeforeSelected.length > 0) {
      overrideDialog.onOpen()
      return
    }
    commitSchedule()
  }

  const commitSchedule = () => {
    onScheduleConfirm(scheduleDate, normalizedVersionNote(versionNote))
    overrideDialog.onClose()
    onClose()
  }

  const commitForcePublish = () => {
    onForcePublishNow?.(normalizedVersionNote(versionNote))
    onClose()
  }

  const onCancel = () => {
    onClose()
    uiStore.flashMessage.show(EFlashMessageStatus.warning, t(nk("scheduleModalCancelMessage")), "")
  }

  useEffect(() => {
    if (!isOpen) {
      setScheduleDate(null)
      setVersionNote("")
      setConfigErrors([])
      setIsValidating(false)
      return
    }

    if (!onSaveAndValidate) return

    let cancelled = false
    setIsValidating(true)
    setConfigErrors([])
    ;(async () => {
      try {
        const errors = await onSaveAndValidate()
        if (!cancelled) setConfigErrors(errors ?? [])
      } catch {
        if (!cancelled) setConfigErrors([])
      } finally {
        if (!cancelled) setIsValidating(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isOpen])

  const formattedConflictDates = (list: Array<{ versionDate: Date }>) =>
    list.map((c) => format(c.versionDate, "PPP")).join(", ")

  return (
    <>
      {!hideManageAccessButton && (
        <Button variant="secondary" onClick={onAccessOpen}>
          {t("requirementTemplate.access.title", "Manage access")}
        </Button>
      )}
      {renderTrigger ? (
        renderTrigger(onOpen)
      ) : (
        <Button variant={"primary"} rightIcon={<CaretRight />} onClick={onOpen} {...triggerButtonProps}>
          {triggerLabel ?? t("ui.publish")}
        </Button>
      )}
      {requirementTemplate && (
        <TemplateAccessSidebar
          requirementTemplate={requirementTemplate}
          isOpen={isAccessOpen}
          onClose={onAccessClose}
        />
      )}
      <Modal isOpen={isOpen} onClose={onClose} autoFocus={false}>
        <ModalOverlay />
        <ModalContent w="full" maxW={onForcePublishNow ? "680px" : "436px"} mx={4}>
          <ModalHeader fontSize={"2xl"} mt={2}>
            {t(nk("scheduleModalTitle"))}
          </ModalHeader>
          <ModalBody>
            {isValidating ? (
              <Center py={10}>
                <Spinner size="lg" />
              </Center>
            ) : (
              <>
                <Text>
                  <Trans
                    // @ts-ignore
                    i18nKey={nk("scheduleModalBody")}
                    values={{ count: requirementTemplate?.availableIn ?? 0 }}
                    components={{
                      1: <Text as="span" fontWeight="bold" />,
                    }}
                  />
                </Text>
                <Stack spacing={1} mt={6}>
                  <Text>
                    <Trans
                      // @ts-ignore
                      i18nKey={nk("scheduleModalHelperText")}
                      components={{
                        1: <Text as="span" color="semantic.error" fontWeight="bold" />,
                      }}
                    />
                  </Text>

                  <Box>
                    <DatePicker
                      selected={scheduleDate}
                      onChange={setScheduleDate}
                      minDate={minDate}
                      readOnly={hasConfigErrors}
                    />
                  </Box>
                </Stack>

                <Box mt={6}>
                  <VersionNoteField value={versionNote} onChange={setVersionNote} isDisabled={hasConfigErrors} />
                </Box>

                {requirementTemplate && (
                  <ConfigErrorsList
                    errors={configErrors}
                    requirementTemplateId={requirementTemplate.id}
                    onNavigate={onClose}
                  />
                )}

                {conflictsOnOrBeforeSelected.length > 0 && (
                  <Alert status="warning" mt={4} borderRadius="md" alignItems="flex-start">
                    <AlertIcon mt={1} />
                    <Text>
                      <Trans
                        // @ts-ignore
                        i18nKey={nk("conflictWarning")}
                        values={{
                          dates: formattedConflictDates(conflictsOnOrBeforeSelected),
                        }}
                        components={{ 1: <Text as="span" fontWeight="bold" /> }}
                      />
                    </Text>
                  </Alert>
                )}

                {laterScheduled.length > 0 && (
                  <Alert status="info" mt={4} borderRadius="md" alignItems="flex-start">
                    <AlertIcon mt={1} />
                    <Text>
                      <Trans
                        // @ts-ignore
                        i18nKey={nk("laterScheduledWarning")}
                        values={{ dates: formattedConflictDates(laterScheduled) }}
                        components={{ 1: <Text as="span" fontWeight="bold" /> }}
                      />
                    </Text>
                  </Alert>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter justifyContent={"flex-start"} mt={4} gap={3} flexWrap={"wrap"}>
            <Button variant={"primary"} isDisabled={!scheduleDate || actionsDisabled} onClick={onSchedule}>
              {t("ui.confirm")}
            </Button>
            <Button variant={"secondary"} onClick={onCancel} isDisabled={isValidating}>
              {t("ui.neverMind")}
            </Button>
            {onForcePublishNow && (
              <Button
                variant={"secondary"}
                color={"error"}
                borderColor={"error"}
                onClick={commitForcePublish}
                isDisabled={actionsDisabled}
                ml={{ base: 0, md: "auto" }}
              >
                {t(nk("forcePublishNow"))}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={overrideDialog.isOpen}
        leastDestructiveRef={overrideCancelRef}
        onClose={overrideDialog.onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              {t(nk("confirmOverrideTitle"))}
            </AlertDialogHeader>
            <AlertDialogBody>
              <Trans
                // @ts-ignore
                i18nKey={nk("confirmOverrideBody")}
                values={{
                  dates: formattedConflictDates(conflictsOnOrBeforeSelected),
                  newDate: scheduleDate ? format(scheduleDate, "PPP") : "",
                }}
                components={{ 1: <Text as="span" fontWeight="bold" /> }}
              />
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={overrideCancelRef} variant="secondary" onClick={overrideDialog.onClose}>
                {t("ui.neverMind")}
              </Button>
              <Button variant="primary" onClick={commitSchedule} ml={3}>
                {t("ui.confirm")}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  )
})
