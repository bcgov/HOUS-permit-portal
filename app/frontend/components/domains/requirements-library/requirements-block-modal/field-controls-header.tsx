import { Button, HStack } from "@chakra-ui/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IFormConditional } from "../../../../types/api-request"
import { ERequirementType } from "../../../../types/enums"
import { ElectiveTag } from "../../../shared/elective-tag"
import { HasConditionalTag } from "../../../shared/has-conditional-tag"
import { RequirementTypeTag } from "../../../shared/requirement-type-tag"
import { IRequirementOptionsMenu, OptionsMenu } from "../requirement-field-edit/options-menu"

interface IProps {
  isRequirementInEditMode: boolean
  toggleRequirementToEdit: () => void
  requirementType: ERequirementType
  onRemove: IRequirementOptionsMenu["onRemove"]
  disabledMenuOptions?: IRequirementOptionsMenu["disabledOptions"]
  elective?: boolean
  conditional?: IFormConditional
  index: number
}

export function FieldControlsHeader({
  disabledMenuOptions,
  isRequirementInEditMode,
  toggleRequirementToEdit,
  elective,
  conditional,
  requirementType,
  onRemove,
  index,
}: IProps) {
  const { t } = useTranslation()

  return (
    <HStack pos={"absolute"} right={0} top={0} spacing={4}>
      {/*right now there is only two menu options,so if both are disabled we just hide the options menu*/}
      {isRequirementInEditMode &&
        !(disabledMenuOptions.includes("remove") && disabledMenuOptions.includes("conditional")) && (
          <OptionsMenu
            menuButtonProps={{
              size: "sm",
            }}
            onRemove={onRemove}
            disabledOptions={disabledMenuOptions}
            index={index}
          />
        )}
      <HStack className={"requirement-edit-controls-container"}>
        {elective && !isRequirementInEditMode && <ElectiveTag display={isRequirementInEditMode ? "none" : "flex"} />}
        {conditional && !isRequirementInEditMode && (
          <HasConditionalTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {!isRequirementInEditMode && (
          <RequirementTypeTag type={requirementType} className={"requirement-edit-controls"} display={"none"} />
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
