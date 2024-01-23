import {
  Checkbox,
  CheckboxGroup,
  CheckboxProps,
  FormControl,
  FormHelperText,
  FormLabel,
  FormLabelProps,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Radio,
  RadioGroup,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, MapPin } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FieldValues } from "react-hook-form"
import { FieldPath } from "react-hook-form/dist/types"
import { UseControllerProps } from "react-hook-form/dist/types/controller"
import { useTranslation } from "react-i18next"
import { ENumberUnit, ERequirementType } from "../../../../types/enums"
import {
  EditableInputWithControls,
  IEditableInputWithControlsProps,
} from "../../../shared/editable-input-with-controls"
import { UnitSelect } from "../../../shared/select/selectors/unit-select"

const labelProps: Partial<FormLabelProps> = {
  fontWeight: 700,
}

type TRequirementEditProps<TFieldValues extends FieldValues> = {
  label?: string
  options?: string[]
  helperText?: string
  editableLabelProps?: IEditableInputWithControlsProps
  editableHelperTextProps?: IEditableInputWithControlsProps
  checkboxProps: {
    controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
  } & Partial<CheckboxProps>
  unitSelectProps: {
    controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
  }
}

const helperTextStyles = {
  fontWeight: 400,
  color: "text.secondary",
  fontSize: "sm",
  controlsProps: {
    iconButtonProps: {
      sx: {
        svg: { width: "12px !important", height: "12px !important" },
      },
    },
  },
}

const defaultOptions = ["Option", "Option"]

const requirementsComponentMap = {
  [ERequirementType.text]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <Input bg={"white"} isReadOnly />
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.addHelpText")}
          placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
          {...editableHelperTextProps}
        />
        <Controller<TFieldValues>
          {...controlProps}
          render={({ field: checkboxField }) => (
            // @ts-ignore
            <Checkbox {...restCheckboxProps} {...checkboxField}>
              {t("requirementsLibrary.modals.optionalForSubmitters")}
            </Checkbox>
          )}
        />
      </Stack>
    )
  },

  [ERequirementType.address]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <InputGroup>
          <InputLeftElement>
            <MapPin />
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.addHelpText")}
          placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
          {...editableHelperTextProps}
        />
        <Controller<TFieldValues>
          {...controlProps}
          render={({ field: checkboxField }) => (
            // @ts-ignore
            <Checkbox {...restCheckboxProps} {...checkboxField}>
              {t("requirementsLibrary.modals.optionalForSubmitters")}
            </Checkbox>
          )}
        />
      </Stack>
    )
  },

  [ERequirementType.date]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps
    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <InputGroup w={"166px"}>
          <InputLeftElement>
            <CalendarBlank />
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.addHelpText")}
          placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
          {...editableHelperTextProps}
        />
        <Controller<TFieldValues>
          {...controlProps}
          render={({ field: checkboxField }) => (
            // @ts-ignore
            <Checkbox {...restCheckboxProps} {...checkboxField}>
              {t("requirementsLibrary.modals.optionalForSubmitters")}
            </Checkbox>
          )}
        />
      </Stack>
    )
  },

  [ERequirementType.number]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
    unitSelectProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps: checkboxControlProps, ...restCheckboxProps } = checkboxProps
    const { controlProps: unitSelectControlProps } = unitSelectProps
    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <HStack>
          <Input bg={"white"} isReadOnly w={"130px"} />
          <Controller<TFieldValues>
            {...unitSelectControlProps}
            render={({ field: { onChange, value } }) => <UnitSelect value={value as ENumberUnit} onChange={onChange} />}
          />
        </HStack>
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.addHelpText")}
          placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
          {...editableHelperTextProps}
        />
        <Controller<TFieldValues>
          {...checkboxControlProps}
          render={({ field: checkboxField }) => (
            // @ts-ignore
            <Checkbox {...restCheckboxProps} {...checkboxField}>
              {t("requirementsLibrary.modals.optionalForSubmitters")}
            </Checkbox>
          )}
        />
      </Stack>
    )
  },

  [ERequirementType.textArea]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps
    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <Textarea bg={"white"} _hover={{ borderColor: "border.base" }} isReadOnly />
        <EditableInputWithControls
          initialHint={t("requirementsLibrary.modals.addHelpText")}
          placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
          {...editableHelperTextProps}
        />
        <Controller<TFieldValues>
          {...controlProps}
          render={({ field: checkboxField }) => (
            // @ts-ignore
            <Checkbox {...restCheckboxProps} {...checkboxField}>
              {t("requirementsLibrary.modals.optionalForSubmitters")}
            </Checkbox>
          )}
        />
      </Stack>
    )
  },

  [ERequirementType.radio]: function <TFieldValues>({
    label,
    options = defaultOptions,
    helperText,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>{label || t("requirementsLibrary.requirementTypeLabels.radio")}</FormLabel>
        <RadioGroup defaultValue="1">
          <Stack>
            {options.map((option) => (
              <Radio value={option}>{option}</Radio>
            ))}
          </Stack>
        </RadioGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },

  [ERequirementType.multiSelectCheckbox]: function <TFieldValues>({
    label,
    helperText,
    options = defaultOptions,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    return (
      <FormControl isReadOnly>
        <FormLabel {...labelProps}>
          {label || t("requirementsLibrary.requirementTypeLabels.multiSelectCheckbox")}
        </FormLabel>
        <CheckboxGroup>
          <Stack>
            {options.map((option) => (
              <Checkbox value={option}>{option}</Checkbox>
            ))}
          </Stack>
        </CheckboxGroup>
        {helperText && <FormHelperText {...helperTextStyles}>{helperText}</FormHelperText>}
      </FormControl>
    )
  },
}

type TProps<TFieldValues> = {
  requirementType: ERequirementType
} & TRequirementEditProps<TFieldValues>

export function hasRequirementFieldEditComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}

export const RequirementFieldEdit = observer(function RequirementFieldDisplay<TFieldValues>({
  requirementType,
  ...rest
}: TProps<TFieldValues>) {
  return requirementsComponentMap[requirementType]?.(rest) ?? null
})
