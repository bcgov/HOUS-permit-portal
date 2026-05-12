import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { useMst } from "../../../../../setup/root"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { TagsSelect } from "../../../../shared/select/selectors/tags-select"
import { BuilderHeader } from "./builder-header"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

export const EditableBuilderHeader = observer(function EditableBuilderHeader({ requirementTemplate }: IProps) {
  const { t } = useTranslation()
  const {
    requirementTemplateStore: { searchTagOptions },
  } = useMst()
  const { control, register } = useFormContext<IRequirementTemplateForm>()
  const {
    field: { value: description, onChange: onDescriptionChange },
  } = useController({ control, name: "description" })

  const {
    field: { value: nickname, onChange: onNicknameChange },
  } = useController({ control, name: "nickname" })

  const breadCrumbs = [
    {
      href: "/requirement-templates",
      title: t("site.breadcrumb.requirementTemplates"),
    },
    {
      href: `/requirement-templates/${requirementTemplate.id}/edit`,
      title: t("site.breadcrumb.editTemplate"),
    },
  ]

  return (
    <BuilderHeader
      breadCrumbs={breadCrumbs}
      requirementTemplate={requirementTemplate}
      renderHeading={() => (
        <EditableInputWithControls
          w="full"
          initialHint={t("permitApplication.edit.clickToWriteNickname")}
          value={nickname || ""}
          editableInputProps={{
            fontWeight: 700,
            fontSize: "3xl",
            width: "100%",
            ...register("nickname", {
              maxLength: {
                value: 256,
                message: t("ui.invalidInput"),
              },
            }),
            "aria-label": "Edit Nickname",
          }}
          editablePreviewProps={{
            fontWeight: 700,
            fontSize: "3xl",
          }}
          aria-label={"Edit Nickname"}
          onChange={onNicknameChange}
          onSubmit={onNicknameChange}
          onCancel={onNicknameChange}
        />
      )}
      renderDescription={() => (
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.clickToWriteDescription")}
          value={description || ""}
          editableInputProps={{
            ...register("description", {
              maxLength: {
                value: 1024,
                message: t("ui.invalidInput"),
              },
            }),
            "aria-label": "Edit Template Description",
          }}
          aria-label={"Edit Template Description"}
          onChange={onDescriptionChange}
          onSubmit={onDescriptionChange}
          onCancel={onDescriptionChange}
        />
      )}
      renderTags={() => (
        <Controller
          name="tags"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TagsSelect
              onChange={(options) => onChange(options.map((o) => o.value))}
              fetchOptions={(query) => searchTagOptions(query)}
              placeholder={t("requirementTemplate.fields.tags")}
              selectedOptions={(value ?? []).map((tag) => ({ value: tag, label: tag }))}
              styles={{
                container: (css) => ({ ...css, minWidth: "20rem" }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
            />
          )}
        />
      )}
      forEdit
      showBackButton
    />
  )
})
