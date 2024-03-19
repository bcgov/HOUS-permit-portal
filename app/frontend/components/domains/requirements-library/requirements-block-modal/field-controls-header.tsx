import { Button, HStack } from "@chakra-ui/react"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { ElectiveTag } from "../../../shared/elective-tag"
import { HasConditionalTag } from "../../../shared/has-conditional-tag"
import { RequirementTypeTag } from "../../../shared/requirement-type-tag"
import { OptionsMenu } from "../requirement-field-edit/options-menu"
import { IRequirementBlockForm } from "./index"

interface IProps {
  requirementIndex: number
  isRequirementInEditMode: boolean
  toggleRequirementToEdit: () => void
}

export function FieldControlsHeader({ requirementIndex, isRequirementInEditMode, toggleRequirementToEdit }: IProps) {
  const { t } = useTranslation()
  const { watch, control } = useFormContext<IRequirementBlockForm>()
  const { remove } = useFieldArray<IRequirementBlockForm>({
    control,
    name: "requirementsAttributes",
  })
  const watchedElective = watch(`requirementsAttributes.${requirementIndex}.elective`)
  const watchedConditional = watch(`requirementsAttributes.${requirementIndex}.inputOptions.conditional`)
  const watchedRequirementType = watch(`requirementsAttributes.${requirementIndex}.inputType`)

  return (
    <HStack pos={"absolute"} right={0} top={0} spacing={4}>
      {isRequirementInEditMode && (
        <OptionsMenu
          menuButtonProps={{
            size: "sm",
          }}
          onRemove={() => remove(requirementIndex)}
          conditional={watchedConditional}
        />
      )}
      <HStack className={"requirement-edit-controls-container"}>
        {watchedElective && !isRequirementInEditMode && (
          <ElectiveTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {watchedConditional && !isRequirementInEditMode && (
          <HasConditionalTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {!isRequirementInEditMode && (
          <RequirementTypeTag type={watchedRequirementType} className={"requirement-edit-controls"} display={"none"} />
        )}
        <Button
          variant={"primary"}
          size={"sm"}
          onClick={toggleRequirementToEdit}
          className={"requirement-edit-controls"}
          display={isRequirementInEditMode ? "flex" : "none"}
        >
          {t(isRequirementInEditMode ? "ui.done" : "ui.edit")}
        </Button>
      </HStack>
    </HStack>
  )
}
