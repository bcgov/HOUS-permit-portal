import { Button, HStack } from "@chakra-ui/react"
import { X } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { IDataValidation, IFormConditional } from "../../../../types/api-request"
import { ERequirementType } from "../../../../types/enums"
import { TComputedCompliance } from "../../../../types/types"
import { ElectiveTag } from "../../../shared/elective-tag"
import { HasAutomatedComplianceTag } from "../../../shared/has-automated-compliance-tag"
import { HasConditionalTag } from "../../../shared/has-conditional-tag"
import { HasDataValidationTag } from "../../../shared/has-data-validation-tag"
import { RequirementTypeTag } from "../../../shared/requirement-type-tag"
import { IRequirementOptionsMenu, OptionsMenu } from "../requirement-field-edit/options-menu"

interface IProps {
  isRequirementInEditMode: boolean
  toggleRequirementToEdit?: () => void
  requirementType: ERequirementType
  requirementCode: string
  onRemove: IRequirementOptionsMenu["onRemove"]
  onDetachBankQuestion?: IRequirementOptionsMenu["onDetachBankQuestion"]
  onOpenBankQuestion?: IRequirementOptionsMenu["onOpenBankQuestion"]
  isBankLinked?: boolean
  disabledMenuOptions?: IRequirementOptionsMenu["disabledOptions"]
  hideConditional?: boolean
  hidePlacementConfiguration?: boolean
  elective?: boolean
  conditional?: IFormConditional
  computedCompliance?: TComputedCompliance
  dataValidation?: IDataValidation
  index: number
}

export function FieldControlsHeader({
  disabledMenuOptions = [],
  hideConditional = false,
  hidePlacementConfiguration = false,
  isRequirementInEditMode,
  toggleRequirementToEdit,
  elective,
  conditional,
  requirementType,
  computedCompliance,
  dataValidation,
  onRemove,
  onDetachBankQuestion,
  onOpenBankQuestion,
  isBankLinked = false,
  index,
  requirementCode,
}: IProps) {
  const { t } = useTranslation()

  return (
    <HStack pos={"absolute"} right={0} top={0} spacing={4}>
      {isRequirementInEditMode && hidePlacementConfiguration && !disabledMenuOptions.includes("remove") && (
        <Button variant={"ghost"} size={"sm"} color={"semantic.error"} leftIcon={<X />} onClick={onRemove}>
          {t("requirementsLibrary.modals.optionsMenu.remove")}
        </Button>
      )}
      {/* Keep stale configuration removable even when field removal and conditionals are protected. */}
      {isRequirementInEditMode &&
        !hidePlacementConfiguration &&
        (isBankLinked ||
          !(
            disabledMenuOptions.includes("remove") &&
            disabledMenuOptions.includes("conditional") &&
            !dataValidation &&
            !computedCompliance
          )) && (
          <OptionsMenu
            menuButtonProps={{
              size: "sm",
            }}
            onRemove={onRemove}
            onDetachBankQuestion={onDetachBankQuestion}
            onOpenBankQuestion={onOpenBankQuestion}
            isBankLinked={isBankLinked}
            disabledOptions={disabledMenuOptions}
            hideConditional={hideConditional}
            hidePlacementConfiguration={hidePlacementConfiguration}
            index={index}
            hasDataValidation={!!dataValidation}
            requirementType={requirementType}
          />
        )}
      <HStack className={"requirement-edit-controls-container"} p={2}>
        {elective && !isRequirementInEditMode && <ElectiveTag display={isRequirementInEditMode ? "none" : "flex"} />}
        {conditional && !isRequirementInEditMode && (
          <HasConditionalTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {dataValidation && !isRequirementInEditMode && (
          <HasDataValidationTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {!isRequirementInEditMode && computedCompliance?.module && (
          <HasAutomatedComplianceTag display={isRequirementInEditMode ? "none" : "flex"} />
        )}
        {!isRequirementInEditMode && (
          <RequirementTypeTag type={requirementType} className={"requirement-edit-controls"} />
        )}
        {toggleRequirementToEdit && (
          <Button
            variant={"primary"}
            size={"sm"}
            onClick={toggleRequirementToEdit}
            className={"requirement-edit-controls"}
            display={isRequirementInEditMode ? "flex" : "none"}
          >
            {t(isRequirementInEditMode ? "ui.done" : "ui.edit")}
          </Button>
        )}
      </HStack>
    </HStack>
  )
}
