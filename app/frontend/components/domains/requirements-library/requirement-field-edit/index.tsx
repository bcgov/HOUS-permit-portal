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

type TRequirementEditProps<TFieldValues extends FieldValues> = TEditableGroupProps<TFieldValues> & {
  unitSelectProps?: IControlProps<TFieldValues>
  multiOptionProps?: {
    useFieldArrayProps: UseFieldArrayProps<TFieldValues>
    onOptionValueChange: (optionIndex: number, optionValue: string) => void
    getOptionValue: (idx: number) => IOption
  }
}

type TEditableGroupProps<TFieldValues extends FieldValues> = {
  editableLabelProps?: IControlProps<TFieldValues> & Partial<IEditableInputWithControlsProps>
  editableHelperTextProps?: IControlProps<TFieldValues> & Partial<IEditableInputWithControlsProps>
  isOptionalCheckboxProps: IControlProps<TFieldValues> & Partial<CheckboxProps>
  isElectiveCheckboxProps: IControlProps<TFieldValues> & Partial<CheckboxProps>
  editableInput?: JSX.Element
  multiOptionEditableInput?: JSX.Element
}

const requirementsComponentMap = {
  [ERequirementType.text]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return <EditableGroup editableInput={<Input bg={"white"} isReadOnly />} {...props} />
  },

  [ERequirementType.phone]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return (
      <EditableGroup
        editableInput={
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <i className="fa fa-phone"></i>
            </InputLeftElement>
            <Input bg={"white"} isReadOnly />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.email]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return (
      <EditableGroup
        editableInput={
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <i className="fa fa-envelope"></i>
            </InputLeftElement>
            <Input bg={"white"} isReadOnly />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.address]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return (
      <EditableGroup
        editableInput={
          <InputGroup>
            <InputLeftElement>
              <MapPin />
            </InputLeftElement>
            <Input bg={"white"} isReadOnly />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.date]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return (
      <EditableGroup
        editableInput={
          <InputGroup w={"166px"}>
            <InputLeftElement>
              <CalendarBlank />
            </InputLeftElement>
            <Input bg={"white"} isReadOnly />
          </InputGroup>
        }
        {...props}
      />
    )
  },

  [ERequirementType.number]: function <TFieldValues>({
    unitSelectProps,
    ...editableGroupProps
  }: TRequirementEditProps<TFieldValues>) {
    if (!unitSelectProps) {
      import.meta.env.DEV && console.error("unitSelectProps is required for number requi  rement edit")
      return null
    }

    const { controlProps: unitSelectControlProps } = unitSelectProps

    return (
      <EditableGroup
        editableInput={
          <HStack>
            <Input bg={"white"} isReadOnly w={"130px"} />
            <Controller<TFieldValues>
              {...unitSelectControlProps}
              render={({ field: { onChange, value } }) => (
                <UnitSelect value={value as ENumberUnit} onChange={onChange} />
              )}
            />
          </HStack>
        }
        {...editableGroupProps}
      />
    )
  },

  [ERequirementType.textArea]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return (
      <EditableGroup
        editableInput={<Textarea bg={"white"} _hover={{ borderColor: "border.base" }} isReadOnly />}
        {...props}
      />
    )
  },

  [ERequirementType.radio]: function <TFieldValues>({
    multiOptionProps,
    ...editableGroupProps
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for radio requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <EditableGroup
        multiOptionEditableInput={
          <>
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
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                />
              </HStack>
            ))}

            {/*  @ts-ignore*/}
            <Button variant={"link"} textDecoration={"underline"} onClick={() => append({ value: "", label: "" })}>
              {t("requirementsLibrary.modals.addOptionButton")}
            </Button>
          </>
        }
        {...editableGroupProps}
      />
    )
  },

  [ERequirementType.checkbox]: function <TFieldValues>({
    multiOptionProps,
    ...editableGroupProps
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for checkbox requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <EditableGroup
        multiOptionEditableInput={
          <>
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
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                />
              </HStack>
            ))}

            {/*  @ts-ignore*/}
            <Button variant={"link"} textDecoration={"underline"} onClick={() => append({ value: "", label: "" })}>
              {t("requirementsLibrary.modals.addOptionButton")}
            </Button>
          </>
        }
        {...editableGroupProps}
      />
    )
  },

  [ERequirementType.multiOptionSelect]: function <TFieldValues>({
    multiOptionProps,
    ...editableGroupProps
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for multiOptionSelect requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <EditableGroup
        multiOptionEditableInput={
          <>
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
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                />
              </HStack>
            ))}

            {/*  @ts-ignore*/}
            <Button variant={"link"} textDecoration={"underline"} onClick={() => append({ value: "", label: "" })}>
              {t("requirementsLibrary.modals.addOptionButton")}
            </Button>
          </>
        }
        {...editableGroupProps}
      />
    )
  },

  [ERequirementType.select]: function <TFieldValues>({
    multiOptionProps,
    ...editableGroupProps
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()

    if (!multiOptionProps) {
      import.meta.env.DEV && console.error("multiOptionProps is required for select requirement edit")
      return null
    }

    const { useFieldArrayProps, onOptionValueChange, getOptionValue } = multiOptionProps

    const { fields, append, remove } = useFieldArray<TFieldValues>(useFieldArrayProps)

    return (
      <EditableGroup
        multiOptionEditableInput={
          <>
            {fields.map((field, idx) => (
              <HStack key={field.id}>
                <Input
                  bg={"white"}
                  size={"sm"}
                  value={getOptionValue(idx).label}
                  onChange={(e) => onOptionValueChange(idx, e.target.value)}
                  w={"150px"}
                />
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                />
              </HStack>
            ))}

            {/*  @ts-ignore*/}
            <Button variant={"link"} textDecoration={"underline"} onClick={() => append({ value: "", label: "" })}>
              {t("requirementsLibrary.modals.addOptionButton")}
            </Button>
          </>
        }
        {...editableGroupProps}
      />
    )
  },

  [ERequirementType.file]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    return <EditableGroup editableInput={<i className="fa fa-cloud-upload"></i>} {...props} />
  },

  [ERequirementType.energyStepCode]: function <TFieldValues>(props) {
    return <EditableGroup editableInput={<i className="fa fa-bolt"></i>} {...props} />
  },
}

type TProps<TFieldValues> = {
  requirementType: ERequirementType
} & TRequirementEditProps<TFieldValues>

export const RequirementFieldEdit = observer(function RequirementFieldDisplay<TFieldValues>({
  requirementType,
  ...rest
}: TProps<TFieldValues>) {
  return requirementsComponentMap[requirementType]?.(rest) ?? null
})

function EditableLabel<TFieldValues extends FieldValues>({
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
}

function EditableHelperText<TFieldValues extends FieldValues>({
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
}

function IsOptionalCheckbox<TFieldValues extends FieldValues>({
  controlProps,
  ...checkboxProps
}: TRequirementEditProps<TFieldValues>["isOptionalCheckboxProps"]) {
  const {
    field: { value, onChange, ...restField },
  } = useController(controlProps)
  const { t } = useTranslation()

  return (
    //   This is checked inverse of the boolean value. This is because the db field is for "required", instead of
    //   optional, and by default it should be required
    <Checkbox
      {...checkboxProps}
      isChecked={value === undefined ? value : !value}
      onChange={(e) => {
        onChange(!e.target.checked)
      }}
      {...restField}
    >
      {t("requirementsLibrary.modals.optionalForSubmitters")}
    </Checkbox>
  )
}

function IsElectiveCheckbox<TFieldValues extends FieldValues>({
  controlProps,
  ...checkboxProps
}: TRequirementEditProps<TFieldValues>["isElectiveCheckboxProps"]) {
  const {
    field: { value, ...restField },
  } = useController(controlProps)
  const { t } = useTranslation()
  return (
    <Checkbox {...checkboxProps} isChecked={value} {...restField}>
      {t("requirementsLibrary.modals.isAnElectiveField")}
    </Checkbox>
  )
}

function EditableGroup<TFieldValues>({
  editableLabelProps,
  editableHelperTextProps,
  editableInput,
  multiOptionEditableInput,
  isOptionalCheckboxProps,
  isElectiveCheckboxProps,
}: TEditableGroupProps<TFieldValues>) {
  return (
    <Stack spacing={4}>
      <EditableLabel {...editableLabelProps} />
      {editableInput}
      {editableInput && <EditableHelperText {...editableHelperTextProps} />}
      {multiOptionEditableInput && (
        <Stack>
          {multiOptionEditableInput}
          <EditableHelperText {...editableHelperTextProps} />
        </Stack>
      )}
      <IsOptionalCheckbox {...isOptionalCheckboxProps} />
      <IsElectiveCheckbox mt={"0.625rem"} {...isElectiveCheckboxProps} />
    </Stack>
  )
}

export function hasRequirementFieldEditComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}
