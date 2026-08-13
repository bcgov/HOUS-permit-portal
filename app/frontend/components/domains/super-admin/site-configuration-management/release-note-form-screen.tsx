import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CheckCircle, Minus, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useController, useForm, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { matchPath, useLocation, useNavigate, useParams } from "react-router-dom"
import { RELEASE_NOTE_TYPES } from "../../../../constants/release-note-type-config"
import { useMst } from "../../../../setup/root"
import {
  EFlashMessageStatus,
  EReleaseNoteNotificationAudience,
  EReleaseNoteStatus,
  EReleaseNoteType,
} from "../../../../types/enums"
import { TReleaseNoteFormData } from "../../../../types/types"
import { isTipTapEmpty } from "../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { ConfirmationModal } from "../../../shared/confirmation-modal"
import { Editor } from "../../../shared/editor/editor"
import { DatePickerFormControl, SelectFormControl } from "../../../shared/form/input-form-control"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"
import { ReleaseNoteTypeFields } from "../../release-notes/release-note-type-fields"

const releaseNoteEditorChrome = {
  ".tiptap-wrapper": {
    bg: "white",
    width: "100%",
  },
  ".tiptap-toolbar": {
    bg: "white",
    border: "none",
    borderBottom: "1px solid",
    borderColor: "border.light",
    borderRadius: 0,
    py: 2,
    px: 3,
  },
  ".tiptap-toolbar-button": {
    color: "text.primary",
  },
  ".tiptap-editor": {
    border: "none",
    borderRadius: 0,
    minHeight: "154px",
    px: 4,
    py: 4,
    fontSize: "md",
    lineHeight: 1.6,
    "& p": { margin: 0 },
  },
}

type TReleaseNoteHtmlFieldProps = {
  name: keyof Pick<TReleaseNoteFormData, "content" | "issues">
  label: string
  required?: boolean
}

function ReleaseNoteHtmlField({ name, label, required }: TReleaseNoteHtmlFieldProps) {
  const { t } = useTranslation()
  const { control } = useFormContext<TReleaseNoteFormData>()
  const { field, fieldState } = useController({
    name,
    control,
    rules: required
      ? {
          validate: (v: string) => {
            if (isTipTapEmpty(v ?? "")) {
              return t("ui.isRequired", { field: label })
            }
            return true
          },
        }
      : undefined,
  })

  return (
    <FormControl isInvalid={!!fieldState.error}>
      <FormLabel>
        {label}
        {required && (
          <Text as="span" color="semantic.error" ml={1}>
            *
          </Text>
        )}
      </FormLabel>
      <Box
        border="1px solid"
        borderColor="border.light"
        borderRadius="md"
        overflow="hidden"
        sx={releaseNoteEditorChrome}
        onBlur={field.onBlur}
      >
        <Editor htmlValue={field.value} onChange={field.onChange} />
      </Box>
      {fieldState.error?.message && <FormErrorMessage>{fieldState.error.message}</FormErrorMessage>}
    </FormControl>
  )
}

function ReleaseNoteNotificationAudienceField() {
  const { t } = useTranslation()
  const { control } = useFormContext<TReleaseNoteFormData>()
  const { field } = useController({ name: "notificationAudience", control })

  return (
    <FormControl>
      <FormLabel>{t("releaseNote.form.notificationAudience")}</FormLabel>
      <RadioGroup value={field.value} onChange={field.onChange}>
        <Stack spacing={2}>
          {Object.values(EReleaseNoteNotificationAudience).map((audience) => (
            <Radio key={audience} value={audience}>
              {t(`releaseNote.form.notificationAudiences.${audience}`)}
            </Radio>
          ))}
        </Stack>
      </RadioGroup>
    </FormControl>
  )
}

export const ReleaseNoteFormScreen = observer(function ReleaseNoteFormScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { releaseNoteId } = useParams<{ releaseNoteId: string }>()
  const { releaseNoteStore } = useMst()
  const {
    fetchReleaseNote,
    createReleaseNote,
    updateReleaseNote,
    publishReleaseNote,
    resetCurrentReleaseNote,
    setCurrentReleaseNote,
    getReleaseNoteShareUrl,
  } = releaseNoteStore

  const isCreate = Boolean(
    matchPath({ path: "/configuration-management/release-notes/new", end: true }, location.pathname)
  )

  const [loadError, setLoadError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(!isCreate)
  const [submittingIntent, setSubmittingIntent] = React.useState<"saveDraft" | "publish" | null>(null)
  const [showIssuesSection, setShowIssuesSection] = React.useState(false)

  const formMethods = useForm<TReleaseNoteFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      releaseType: EReleaseNoteType.software,
      notificationAudience: EReleaseNoteNotificationAudience.allUsers,
      version: "",
      name: "",
      releaseDate: null,
      content: "",
      releaseNotesUrl: "",
      issues: "",
    },
  })

  const { handleSubmit, reset, setValue, control } = formMethods
  const releaseType = useWatch({ control, name: "releaseType" })

  useEffect(() => {
    if (isCreate) {
      setShowIssuesSection(false)
      setIsLoading(false)
      resetCurrentReleaseNote()
      return
    }

    const id = releaseNoteId
    if (!id) {
      setLoadError(true)
      setIsLoading(false)
      resetCurrentReleaseNote()
      return
    }

    if (releaseNoteStore.releaseNoteMap.has(id)) {
      setCurrentReleaseNote(id)
    } else {
      setCurrentReleaseNote(null)
    }
    let cancelled = false
    fetchReleaseNote(id).then((note) => {
      if (cancelled) return
      if (note) {
        setCurrentReleaseNote(id)
        const issuesHtml = note.issues ?? ""
        reset({
          releaseType: note.releaseType,
          notificationAudience: EReleaseNoteNotificationAudience.allUsers,
          version: note.version ?? "",
          name: note.name ?? "",
          releaseDate: note.releaseDate ? new Date(note.releaseDate as unknown as string) : null,
          content: note.content ?? "",
          releaseNotesUrl: note.releaseNotesUrl ?? "",
          issues: issuesHtml,
        })
        setShowIssuesSection(!isTipTapEmpty(issuesHtml))
        setLoadError(false)
      } else {
        resetCurrentReleaseNote()
        setLoadError(true)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
      resetCurrentReleaseNote()
    }
  }, [fetchReleaseNote, isCreate, releaseNoteId, reset, resetCurrentReleaseNote, setCurrentReleaseNote])

  const saveDraft = async (data: TReleaseNoteFormData) => {
    const result = isCreate ? await createReleaseNote(data) : await updateReleaseNote(releaseNoteId as string, data)

    if (result.ok) {
      navigate("/configuration-management/release-notes")
    } else {
      console.error("Failed to save release note:", result.error)
    }
  }

  const currentReleaseNote = !isCreate && releaseNoteId ? releaseNoteStore.releaseNoteMap.get(releaseNoteId) : undefined
  const isAlreadyPublished = currentReleaseNote?.status === EReleaseNoteStatus.published

  const isSaveDraftDisabled = submittingIntent === "publish" || isAlreadyPublished

  const confirmPublish = async (closeModal: () => void) => {
    await handleSubmit(async (data) => {
      setSubmittingIntent("publish")
      try {
        await publishFlow(data)
      } finally {
        setSubmittingIntent(null)
        closeModal()
      }
    })()
  }

  const publishFlow = async (data: TReleaseNoteFormData) => {
    if (isCreate) {
      const createResult = await createReleaseNote(data)
      if (!createResult.ok) {
        console.error("Failed to create release note:", createResult.error)
        return
      }
      const publishResult = await publishReleaseNote(createResult.data.id, data)
      if (!publishResult.ok) {
        console.error("Failed to publish release note after create:", publishResult.error)
        navigate(`/configuration-management/release-notes/${createResult.data.id}`, { replace: true })
        return
      }
    } else {
      const publishResult = await publishReleaseNote(releaseNoteId as string, data)
      if (!publishResult.ok) {
        console.error("Failed to publish release note:", publishResult.error)
        return
      }
    }

    navigate("/configuration-management/release-notes")
  }

  const onFormSubmit = handleSubmit(async (data: TReleaseNoteFormData, event?: React.BaseSyntheticEvent) => {
    const submitter = (event?.nativeEvent as SubmitEvent)?.submitter as HTMLButtonElement | null
    // Publish/update is confirmed via modal; only save-draft submits through the form.
    if (submitter?.name !== "intent" || submitter.value !== "saveDraft" || isAlreadyPublished) {
      return
    }

    setSubmittingIntent("saveDraft")
    try {
      await saveDraft(data)
    } finally {
      setSubmittingIntent(null)
    }
  })

  if (isLoading) {
    return (
      <Container maxW="container.lg" py={16} as="main">
        <SharedSpinner />
      </Container>
    )
  }

  if (loadError && !isCreate) {
    return (
      <Container maxW="container.lg" py={8} as="main">
        <Heading size="md" mb={4}>
          {t("site.breadcrumb.notFound")}
        </Heading>
        <RouterLinkButton to="/configuration-management/release-notes" variant="secondary">
          {t("releaseNote.form.cancel")}
        </RouterLinkButton>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={6} px={8} as="main">
      <Flex justify="space-between" align="flex-start" gap={4} mb={8} flexWrap="wrap">
        <Heading color="text.primary" mb={0}>
          {isCreate ? t("releaseNote.form.newTitle") : t("releaseNote.form.editTitle")}
        </Heading>
        {isAlreadyPublished && releaseNoteId && (
          <VStack align="flex-end" spacing={1}>
            <Flex
              as="span"
              align="center"
              gap={1}
              px={2}
              py={1}
              borderRadius="sm"
              bg="semantic.successLight"
              color="semantic.success"
              fontSize="xs"
              fontWeight="bold"
            >
              <CheckCircle size={14} weight="fill" />
              <Text as="span" m={0}>
                {t("releaseNote.status.published")}
              </Text>
            </Flex>
            <Link
              href={getReleaseNoteShareUrl(releaseNoteId)}
              isExternal
              color="text.link"
              fontSize="sm"
              textDecoration="underline"
            >
              {t("releaseNote.form.viewPublishedNote")}
            </Link>
          </VStack>
        )}
      </Flex>

      <FormProvider {...formMethods}>
        <Box as="form" onSubmit={onFormSubmit}>
          <VStack align="stretch" spacing={8}>
            <SelectFormControl
              label={t("releaseNote.form.releaseType")}
              fieldName="releaseType"
              required
              hint={isCreate ? t("releaseNote.form.releaseTypeHint") : null}
              inputProps={{ w: "252px", maxW: "252px", isDisabled: !isCreate }}
              options={RELEASE_NOTE_TYPES.map((type) => ({
                value: type,
                label: t(`releaseNote.types.${type}`),
              }))}
            />
            {releaseType && <ReleaseNoteTypeFields releaseType={releaseType} isAlreadyPublished={isAlreadyPublished} />}
            <DatePickerFormControl
              label={t("releaseNote.form.releaseDate")}
              fieldName="releaseDate"
              required
              inputProps={{
                containerProps: {
                  zIndex: "dropdown",
                  w: "252px",
                  maxW: "252px",
                  sx: {
                    ".react-datepicker-wrapper": { w: "252px" },
                    ".react-datepicker__input-container": { w: "252px" },
                  },
                },
                showTimeInput: true,
                dateFormat: "yyyy/MM/dd h:mm aa",
              }}
            />
            <ReleaseNoteHtmlField name="content" label={t("releaseNote.form.content")} required />
            <VStack align="stretch" spacing={4}>
              <Flex justifyContent="flex-end">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  leftIcon={showIssuesSection ? <Minus size={16} weight="bold" /> : <Plus size={16} weight="bold" />}
                  onClick={() => {
                    if (showIssuesSection) {
                      setValue("issues", "", { shouldDirty: true, shouldTouch: true })
                      setShowIssuesSection(false)
                    } else {
                      setShowIssuesSection(true)
                    }
                  }}
                >
                  {showIssuesSection ? t("releaseNote.form.removeIssues") : t("releaseNote.form.addIssues")}
                </Button>
              </Flex>
              {showIssuesSection && <ReleaseNoteHtmlField name="issues" label={t("releaseNote.form.issues")} />}
            </VStack>
            <Flex
              justifyContent="flex-end"
              alignItems="center"
              gap="16px"
              borderTopWidth="1px"
              borderTopStyle="solid"
              borderTopColor="border.light"
              py={4}
            >
              <RouterLinkButton
                to="/configuration-management/release-notes"
                variant="secondary"
                size="sm"
                isDisabled={submittingIntent !== null}
              >
                {t("releaseNote.form.cancel")}
              </RouterLinkButton>
              <Button
                type="submit"
                name="intent"
                value="saveDraft"
                variant="secondary"
                size="sm"
                isLoading={submittingIntent === "saveDraft"}
                isDisabled={isSaveDraftDisabled}
              >
                {t("releaseNote.form.saveDraft")}
              </Button>
              <ConfirmationModal
                title={
                  isAlreadyPublished
                    ? t("releaseNote.form.updateConfirmation.title")
                    : t("releaseNote.form.publishConfirmation.title")
                }
                triggerText={isAlreadyPublished ? t("releaseNote.form.update") : t("releaseNote.form.publish")}
                body={
                  isAlreadyPublished ? (
                    t("releaseNote.form.updateConfirmation.body")
                  ) : (
                    <VStack align="stretch" spacing={4}>
                      <Text>{t("releaseNote.form.publishConfirmation.body")}</Text>
                      <ReleaseNoteNotificationAudienceField />
                      {releaseType === EReleaseNoteType.content && (
                        <CustomMessageBox
                          status={EFlashMessageStatus.info}
                          description={t("releaseNote.form.publishConfirmation.contentTemplateNotice")}
                        />
                      )}
                    </VStack>
                  )
                }
                renderTriggerButton={({ onClick, ...props }) => (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    isDisabled={submittingIntent === "saveDraft"}
                    {...props}
                    onClick={(e) =>
                      void handleSubmit(() => {
                        if (!isAlreadyPublished) {
                          setValue("notificationAudience", EReleaseNoteNotificationAudience.allUsers)
                        }
                        onClick?.(e)
                      })()
                    }
                  >
                    {isAlreadyPublished ? t("releaseNote.form.update") : t("releaseNote.form.publish")}
                  </Button>
                )}
                confirmButtonProps={{
                  isLoading: submittingIntent === "publish",
                  isDisabled: submittingIntent === "publish",
                }}
                onConfirm={confirmPublish}
              />
            </Flex>
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  )
})
