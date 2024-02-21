import {
  Box,
  Button,
  Checkbox,
  CheckboxProps,
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
import { Controller, FieldValues, useController, useFieldArray } from "react-hook-form"
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

interface IControlProps<TFieldValues extends FieldValues> {
  controlProps: Omit<UseControllerProps<TFieldValues, FieldPath<TFieldValues>>, "render">
}

type TRequirementEditProps<TFieldValues extends FieldValues> = {
  label?: string
  options?: string[]
  helperText?: string
  editableLabelProps?: IControlProps<TFieldValues> & Partial<IEditableInputWithControlsProps>
  editableHelperTextProps?: IControlProps<TFieldValues> & Partial<IEditableInputWithControlsProps>
  checkboxProps: IControlProps<TFieldValues> & Partial<CheckboxProps>
  unitSelectProps?: IControlProps<TFieldValues>
  multiOptionProps?: {
    useFieldArrayProps: UseFieldArrayProps<TFieldValues>
    onOptionValueChange: (optionIndex: number, optionValue: string) => void
    getOptionValue: (idx: number) => IOption
  }
}

const EditableLabel = observer(function EditableLabel<TFieldValues extends FieldValues>({
  controlProps,
  ...editableLabelProps
}: TRequirementEditProps<TFieldValues>["editableLabelProps"]) {
  const {
    field: { onChange, value },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <EditableInputWithControls
      initialHint={t("ui.clickToEdit")}
      defaultValue={(value as string) || t("requirementsLibrary.modals.defaultRequirementLabel")}
      onSubmit={onChange}
      onCancel={onChange}
      {...editableLabelProps}
    />
  )
})

const EditableHelperText = observer(function EditableLabel<TFieldValues extends FieldValues>({
  controlProps,
  ...editableHelperTextProps
}: TRequirementEditProps<TFieldValues>["editableLabelProps"]) {
  const {
    field: { onChange, value },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <EditableInputWithControls
      initialHint={t("requirementsLibrary.modals.addHelpText")}
      placeholder={t("requirementsLibrary.modals.helpTextPlaceHolder")}
      defaultValue={(value as string) || ""}
      onSubmit={onChange}
      onCancel={onChange}
      {...editableHelperTextProps}
    />
  )
})

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
        <EditableLabel {...editableLabelProps} />
        <Input bg={"white"} isReadOnly />
        <EditableHelperText {...editableHelperTextProps} />

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

  [ERequirementType.phone]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    return (
      <Stack spacing={4}>
        <EditableLabel {...editableLabelProps} />
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <i className="fa fa-phone"></i>
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableHelperText {...editableHelperTextProps} />
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

  [ERequirementType.email]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    return (
      <Stack spacing={4}>
        <EditableLabel {...editableLabelProps} />
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <i className="fa fa-envelope"></i>
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableHelperText {...editableHelperTextProps} />
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
        <EditableLabel {...editableLabelProps} />
        <InputGroup>
          <InputLeftElement>
            <MapPin />
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableHelperText {...editableHelperTextProps} />
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
        <EditableLabel {...editableLabelProps} />
        <InputGroup w={"166px"}>
          <InputLeftElement>
            <CalendarBlank />
          </InputLeftElement>
          <Input bg={"white"} isReadOnly />
        </InputGroup>
        <EditableHelperText {...editableHelperTextProps} />
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
        <EditableLabel {...editableLabelProps} />
        <HStack>
          <Input bg={"white"} isReadOnly w={"130px"} />
          <Controller<TFieldValues>
            {...unitSelectControlProps}
            render={({ field: { onChange, value } }) => <UnitSelect value={value as ENumberUnit} onChange={onChange} />}
          />
        </HStack>
        <EditableHelperText {...editableHelperTextProps} />
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
        <EditableLabel {...editableLabelProps} />
        <Textarea bg={"white"} _hover={{ borderColor: "border.base" }} isReadOnly />
        <EditableHelperText {...editableHelperTextProps} />
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
        <EditableLabel {...editableLabelProps} />
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
          <EditableHelperText {...editableHelperTextProps} />
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
    multiOptionProps,
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for checkbox requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <Stack spacing={4}>
        <EditableLabel {...editableLabelProps} />
        <Stack>
          {fields.map((field, idx) => (
            <HStack key={field.id}>
              <Box
                border={"1px solid"}
                borderColor={"border.light"}
                bg={"white"}
                w={"16px"}
                h={"16px"}
                borderRadius={"sm"}
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
          <EditableHelperText {...editableHelperTextProps} />
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
  [ERequirementType.select]: function <TFieldValues>({
    multiOptionProps,
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for select requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <Stack spacing={4}>
        <EditableLabel {...editableLabelProps} />
        <Stack>
          {fields.map((field, idx) => (
            <HStack key={field.id}>
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
          <EditableHelperText {...editableHelperTextProps} />
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

  [ERequirementType.file]: function <TFieldValues>({
    editableLabelProps,
    editableHelperTextProps,
    checkboxProps,
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { controlProps, ...restCheckboxProps } = checkboxProps

    return (
      <Stack spacing={4}>
        <EditableLabel {...editableLabelProps} />
        <i className="fa fa-cloud-upload"></i>
        <EditableHelperText {...editableHelperTextProps} />
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
