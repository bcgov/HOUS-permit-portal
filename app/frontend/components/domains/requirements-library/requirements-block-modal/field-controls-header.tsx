import { Button, HStack, Tag } from "@chakra-ui/react"
import { SlidersHorizontal } from "@phosphor-icons/react"
import React from "react"
import { useFieldArray, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
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
          <Tag
            bg={"theme.yellowLight"}
            color={"text.secondary"}
            fontWeight={700}
            fontSize={"xs"}
            display={isRequirementInEditMode ? "none" : "flex"}
          >
            {t("requirementsLibrary.elective")}
          </Tag>
        )}
        {watchedConditional && !isRequirementInEditMode && (
          <Tag
            bg={"semantic.infoLight"}
            color={"text.secondary"}
            fontWeight={700}
            fontSize={"xs"}
            display={isRequirementInEditMode ? "none" : "flex"}
          >
            <SlidersHorizontal style={{ marginRight: "var(--chakra-space-1)" }} />
            {t("requirementsLibrary.hasConditionalLogic")}
          </Tag>
        )}
        {!isRequirementInEditMode && (
          <Tag
            bg={"greys.grey03"}
            color={"text.secondary"}
            fontWeight={700}
            fontSize={"xs"}
            className={"requirement-edit-controls"}
            display={"none"}
          >
            {getRequirementTypeLabel(watchedRequirementType)}
          </Tag>
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
