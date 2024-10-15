import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useController, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../../../models/requirement-template"
import { ERequirementTemplateType, ETemplateVersionStatus } from "../../../../../types/enums"
import { EditableInputWithControls } from "../../../../shared/editable-input-with-controls"
import { BuilderHeader } from "./builder-header"
import { IRequirementTemplateForm } from "./index"

interface IProps {
  requirementTemplate: IRequirementTemplate
}

export const EditableBuilderHeader = observer(function EditableBuilderHeader({ requirementTemplate }: IProps) {
  const { t } = useTranslation()
  const { control, register, watch, setValue } = useFormContext<IRequirementTemplateForm>()
  const {
    field: { value: description, onChange: onDescriptionChange },
  } = useController({ control, name: "description" })

  const {
    field: { value: nickname, onChange: onNicknameChange },
  } = useController({ control, name: "nickname" })

  const breadCrumbs = {
    [ERequirementTemplateType.EarlyAccessRequirementTemplate]: [
      {
        href: "/early-access",
        title: t("site.breadcrumb.earlyAccess"),
      },
      {
        href: "/early-access/requirement-templates",
        title: t("site.breadcrumb.requirementTemplates"),
      },
      {
        href: `/requirement-templates/${requirementTemplate.id}/edit`,
        title: t("site.breadcrumb.editTemplate"),
      },
    ],
    [ERequirementTemplateType.LiveRequirementTemplate]: [
      {
        href: "/requirement-templates",
        title: t("site.breadcrumb.requirementTemplates"),
      },
      {
        href: `/requirement-templates/${requirementTemplate.id}/edit`,
        title: t("site.breadcrumb.editTemplate"),
      },
    ],
  }

  return (
    <BuilderHeader
      breadCrumbs={breadCrumbs[requirementTemplate.type]}
      requirementTemplate={requirementTemplate}
      status={ETemplateVersionStatus.draft}
      renderHeading={
        requirementTemplate.type !== ERequirementTemplateType.LiveRequirementTemplate &&
        (() => (
          <EditableInputWithControls
            w="full"
            initialHint={t("permitApplication.edit.clickToWriteNickname")}
            value={nickname || ""}
            controlsProps={{
              iconButtonProps: {
                color: "greys.white",
              },
            }}
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
        ))
      }
      renderDescription={() => (
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.clickToWriteDescription")}
          value={description || ""}
          editableInputProps={{
            "aria-label": "Edit Template Description",
          }}
          color={R.isEmpty(description) ? "text.link" : undefined}
          aria-label={"Edit Template Description"}
          onChange={onDescriptionChange}
          onSubmit={onDescriptionChange}
          onCancel={onDescriptionChange}
        />
      )}
    />
  )
})
