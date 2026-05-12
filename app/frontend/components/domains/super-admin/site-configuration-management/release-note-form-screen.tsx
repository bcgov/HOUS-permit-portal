import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Minus, Plus } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useController, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { matchPath, useLocation, useNavigate, useParams } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"
import { TReleaseNoteFormData } from "../../../../types/types"
import { isTipTapEmpty } from "../../../../utils/utility-functions"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { Editor } from "../../../shared/editor/editor"
import { DatePickerFormControl, TextFormControl, UrlFormControl } from "../../../shared/form/input-form-control"
import { RouterLinkButton } from "../../../shared/navigation/router-link-button"

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

export const ReleaseNoteFormScreen = observer(function ReleaseNoteFormScreen() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { releaseNoteId } = useParams<{ releaseNoteId: string }>()
  const { releaseNoteStore, uiStore } = useMst()
  const { fetchReleaseNote, createReleaseNote, updateReleaseNote } = releaseNoteStore

  const isCreate = Boolean(matchPath({ path: "/release-notes/new", end: true }, location.pathname))

  const [loadError, setLoadError] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(!isCreate)
  const [showIssuesSection, setShowIssuesSection] = React.useState(false)

  const formMethods = useForm<TReleaseNoteFormData>({
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      version: "",
      releaseDate: null,
      content: "",
      releaseNotesUrl: "",
      issues: "",
    },
  })

  const { handleSubmit, reset, formState, setValue } = formMethods
  const { isSubmitting } = formState

  useEffect(() => {
    if (isCreate) {
      setShowIssuesSection(false)
      setIsLoading(false)
      return
    }

    const id = releaseNoteId
    if (!id) {
      setLoadError(true)
      setIsLoading(false)
      return
    }

    let cancelled = false
    fetchReleaseNote(id).then((note) => {
      if (cancelled) return
      if (note) {
        const issuesHtml = note.issues ?? ""
        reset({
          version: note.version,
          releaseDate: note.releaseDate ? new Date(note.releaseDate as unknown as string) : null,
          content: note.content ?? "",
          releaseNotesUrl: note.releaseNotesUrl ?? "",
          issues: issuesHtml,
        })
        setShowIssuesSection(!isTipTapEmpty(issuesHtml))
        setLoadError(false)
      } else {
        setLoadError(true)
      }
      setIsLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [fetchReleaseNote, isCreate, releaseNoteId, reset])

  const onSubmit = handleSubmit(async (data) => {
    const result = isCreate ? await createReleaseNote(data) : await updateReleaseNote(releaseNoteId as string, data)

    if (result.ok) {
      uiStore.flashMessage.show(
        EFlashMessageStatus.success,
        null,
        isCreate ? t("releaseNote.form.createSuccess") : t("releaseNote.form.updateSuccess"),
        3000
      )
      navigate("/release-notes")
    } else {
      const message = result.error ?? t("ui.error")
      uiStore.flashMessage.show(EFlashMessageStatus.error, null, String(message), 5000)
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
        <RouterLinkButton to="/release-notes" variant="secondary">
          {t("releaseNote.form.cancel")}
        </RouterLinkButton>
      </Container>
    )
  }

  return (
    <Container maxW="container.lg" py={6} px={8} as="main">
      <Heading color="text.primary" mb={8}>
        {isCreate ? t("releaseNote.form.newTitle") : t("releaseNote.form.editTitle")}
      </Heading>

      <FormProvider {...formMethods}>
        <Box as="form" onSubmit={onSubmit} maxW="720px">
          <VStack align="stretch" spacing={8}>
            <TextFormControl
              label={t("releaseNote.form.version")}
              fieldName="version"
              required
              inputProps={{ w: "252px", maxW: "252px" }}
            />
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
              }}
            />
            <UrlFormControl label={t("releaseNote.form.releaseNotesUrl")} fieldName="releaseNotesUrl" required />
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
              <RouterLinkButton to="/release-notes" variant="secondary" size="sm" isDisabled={isSubmitting}>
                {t("releaseNote.form.cancel")}
              </RouterLinkButton>
              <Button type="submit" variant="secondary" size="sm" isLoading={isSubmitting}>
                {t("releaseNote.form.saveDraft")}
              </Button>
            </Flex>
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  )
})
