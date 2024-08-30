import { Box, BoxProps, Button, Heading, HeadingProps } from "@chakra-ui/react"
import { Plus } from "@phosphor-icons/react"
import React from "react"
import { FieldValues } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { getRequirementTypeLabel } from "../../../../constants"
import { ERequirementType } from "../../../../types/enums"
import { TEditableHelperTextProps } from "../requirement-field-edit/editable-helper-text"
import { TEditableLabelProps } from "../requirement-field-edit/editable-label"
import { GenericFieldItemDisplay } from "./generic-field-item-display"
import { TRequirementFieldDisplayProps } from "./index"

export type TGenericDisplayProps<TFieldValues extends FieldValues> = {
  fieldItems: Array<{
    type: ERequirementType
    key: string
    label: string
    containerProps?: BoxProps
    required?: boolean
  }>
  containerProps?: BoxProps
  editableInput?: JSX.Element
  editableLabelProps?: TEditableLabelProps<TFieldValues>
  editableHelperTextProps?: TEditableHelperTextProps<TFieldValues>
  addAnotherText?: string
  renderHeading?: () => JSX.Element
} & TRequirementFieldDisplayProps

//This is a generic multi-display, it makes the assumption that this is additional info and is NOT ever required.
export function GenericMultiDisplay<TFieldValues>({
  fieldItems,
  label,
  labelProps,
  showAddLabelIndicator,
  renderHeading,
  containerProps,
  showAddButton,
  requirementType,
  addAnotherText,
}: TGenericDisplayProps<TFieldValues>) {
  const { t } = useTranslation()

  return (
    <Box>
      <Box
        w={"full"}
        as={"section"}
        borderRadius={"sm"}
        border={"1px solid"}
        borderColor={"border.light"}
        borderBottomRadius={"none"}
        px={4}
        py={3}
        {...containerProps}
      >
        {renderHeading ? (
          renderHeading()
        ) : (
          <Heading
            as={"h4"}
            fontSize={"md"}
            {...(labelProps as HeadingProps)}
            color={!label && showAddLabelIndicator ? "error" : "text.primary"}
          >
            {label ??
              (showAddLabelIndicator
                ? `${t("requirementsLibrary.modals.addLabel")} *`
                : getRequirementTypeLabel(requirementType))}
          </Heading>
        )}

        <Box w={"full"} display={"grid"} gridTemplateColumns={"repeat(2, calc(50% - 0.75rem))"} gap={"1rem 1.5rem"}>
          {fieldItems.map(({ type, key, label, required, containerProps }) => (
            <Box
              key={type}
              sx={{
                ".chakra-form-control": {
                  display: "flex",
                  flexDir: "column",
                  justifyContent: "space-between",
                  h: "100%",
                },
              }}
              {...containerProps}
            >
              <GenericFieldItemDisplay type={type} label={label} required={required} />
            </Box>
          ))}
        </Box>
      </Box>

      {showAddButton && (
        <Button
          variant={"secondary"}
          leftIcon={<Plus />}
          size={"sm"}
          my={6}
          isDisabled
          // As it is a display component it should have the styles of
          // a normal button but should be disabled to screen readers and not clickable
          _disabled={{
            bg: "transparent",
            color: "text.primary",
            borderWidth: 1,
            borderColor: "border.dark",
            cursor: "not-allowed",
          }}
        >
          {label ? `${t("requirementsLibrary.addAnother")} ${label}` : t("requirementsLibrary.addAnother")}
        </Button>
      )}
    </Box>
  )
}
