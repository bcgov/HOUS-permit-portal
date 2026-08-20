import React from "react"
import { useTranslation } from "react-i18next"
import { RELEASE_NOTE_TYPE_CONFIG, TReleaseNoteTypeField } from "../../../constants/release-note-type-config"
import { EReleaseNoteType } from "../../../types/enums"
import { TextFormControl, UrlFormControl } from "../../shared/form/input-form-control"

// Mirrors `ReleaseNote::SEMVER_REGEX` in app/models/release_note.rb
// https://semver.org/#is-there-a-suggested-regular-expression-regex-to-check-a-semver-string
const releaseNoteSemverRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/

type ReleaseNoteTypeFieldsProps = Readonly<{
  releaseType: EReleaseNoteType
  isAlreadyPublished?: boolean
}>

function ReleaseNoteTypeFieldControl({
  field,
  isAlreadyPublished = false,
}: {
  field: TReleaseNoteTypeField
  isAlreadyPublished?: boolean
}) {
  const { t } = useTranslation()

  switch (field) {
    case "version":
      return (
        <TextFormControl
          label={t("releaseNote.form.version")}
          fieldName="version"
          required
          hint={t("releaseNote.form.versionHint")}
          inputProps={{ w: "252px", maxW: "252px", isDisabled: isAlreadyPublished }}
          validate={{
            semver: (v: string) => !v || releaseNoteSemverRegex.test(v) || t("releaseNote.form.versionInvalidSemver"),
          }}
        />
      )
    case "name":
      return (
        <TextFormControl
          label={t("releaseNote.form.name")}
          fieldName="name"
          required
          hint={t("releaseNote.form.nameHint")}
          inputProps={{ w: "252px", maxW: "252px" }}
        />
      )
    case "releaseNotesUrl":
      return <UrlFormControl label={t("releaseNote.form.releaseNotesUrl")} fieldName="releaseNotesUrl" required />
  }
}

export function ReleaseNoteTypeFields({ releaseType, isAlreadyPublished = false }: ReleaseNoteTypeFieldsProps) {
  const { fields } = RELEASE_NOTE_TYPE_CONFIG[releaseType]

  return (
    <>
      {fields.map((field) => (
        <ReleaseNoteTypeFieldControl key={field} field={field} isAlreadyPublished={isAlreadyPublished} />
      ))}
    </>
  )
}
