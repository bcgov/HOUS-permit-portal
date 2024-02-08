import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  CheckboxProps,
  FormControl,
  FormHelperText,
  FormLabel,
  FormLabelProps,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, MapPin, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FieldValues, useFieldArray } from "react-hook-form"
import { FieldPath, UseFieldArrayProps } from "react-hook-form/dist/types"
import { UseControllerProps } from "react-hook-form/dist/types/controller"
import { useTranslation } from "react-i18next"
import { ENumberUnit, ERequirementType } from "../../../../types/enums"
import { IOption } from "../../../../types/types"
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
  unitSelectProps?: {
    controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
  }
  multiOptionProps?: {
    useFieldArrayProps: UseFieldArrayProps<TFieldValues>
    onOptionValueChange: (optionIndex: number, optionValue: string) => void
    getOptionValue: (idx: number) => IOption
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

    if (!unitSelectProps) {
      import.meta.env.DEV && console.error("unitSelectProps is required for number requi  rement edit")
      return null
    }

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
    multiOptionProps,
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for radio requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <Stack spacing={4}>
        <EditableInputWithControls
          defaultValue={t("requirementsLibrary.modals.defaultRequirementLabel")}
          {...editableLabelProps}
        />
        <Stack>
          {fields.map((field, idx) => (
            <HStack key={field.id}>
              <Box
                border={"1px solid"}
                borderColor={"border.light"}
                bg={"white"}
                w={"16px"}
                h={"16px"}
                borderRadius={"100px"}
              />
              <Input
                bg={"white"}
                size={"sm"}
                value={getOptionValue(idx).label}
                onChange={(e) => onOptionValueChange(idx, e.target.value)}
                w={"150px"}
              />
              <IconButton aria-label={"remove option"} variant={"unstyled"} icon={<X />} onClick={() => remove(idx)} />
            </HStack>
          ))}

          {/*  @ts-ignore*/}
          <Button variant={"link"} textDecoration={"underline"} onClick={() => append({ value: "", label: "" })}>
            {t("requirementsLibrary.modals.addOptionButton")}
          </Button>
          <EditableInputWithControls
            initialHint={t("requirementsLibrary.modals.addHelpText")}
            placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
            {...editableHelperTextProps}
          />
        </Stack>

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

  [ERequirementType.checkbox]: function <TFieldValues>({
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
