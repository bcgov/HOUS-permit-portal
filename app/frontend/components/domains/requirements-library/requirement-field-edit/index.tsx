import {
  Box,
  BoxProps,
  Button,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, Envelope, MapPin, Phone, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Controller, FieldValues, useFieldArray } from "react-hook-form"
import { UseFieldArrayProps } from "react-hook-form/dist/types"
import { useTranslation } from "react-i18next"
import {
  EEnergyStepCodeDependencyRequirementCode,
  ENumberUnit,
  ERequirementContactFieldItemType,
  ERequirementType,
} from "../../../../types/enums"
import { IOption } from "../../../../types/types"
import { isContactRequirement, isMultiOptionRequirement } from "../../../../utils/utility-functions"
import { UnitSelect } from "../../../shared/select/selectors/unit-select"
import { EditableGroup, TEditableGroupProps } from "./editable-group"
import { GenericContactEdit } from "./generic-contact-edit"
import { PidInfoEdit } from "./pid-info-edit"
import { IControlProps } from "./types"

export type TRequirementEditProps<TFieldValues extends FieldValues> = TEditableGroupProps<TFieldValues> & {
  unitSelectProps?: IControlProps<TFieldValues>
  multiOptionProps?: {
    useFieldArrayProps: UseFieldArrayProps<TFieldValues>
    onOptionValueChange: (optionIndex: number, optionValue: string) => void
    getOptionValue: (idx: number) => IOption | undefined
  }
  canAddMultipleContactProps?: IControlProps<TFieldValues>
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
              <Phone />
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
              <Envelope />
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
                  value={getOptionValue(idx)?.label}
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
    return (
      <EditableGroup
        sx={{
          "& > div:first-of-type": {
            alignItems: "center",
            "&:before": {
              content: "''",
              border: "1px solid",
              borderColor: "border.light",
              bg: "white",
              w: "16px",
              h: "16px",
              borderRadius: "sm",
              mr: 2,
            },
          },
        }}
        // only needed for checkbox as it doesn't use the default editableInput and uses
        // css to style the input
        editableInput={<></>}
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

    const { fields, append, remove } = useFieldArray<TFieldValues>({ ...useFieldArrayProps })

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
                  value={getOptionValue(idx)?.label}
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

    const isEnergyStepCodeDependency =
      editableGroupProps.requirementCode === EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod

    return (
      <EditableGroup
        multiOptionEditableInput={
          <>
            {fields.map((field, idx) => (
              <HStack key={field.id}>
                <Input
                  bg={"white"}
                  size={"sm"}
                  value={getOptionValue(idx)?.label}
                  onChange={(e) => onOptionValueChange(idx, e.target.value)}
                  w={"150px"}
                  isDisabled={isEnergyStepCodeDependency}
                />
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                  isDisabled={isEnergyStepCodeDependency}
                />
              </HStack>
            ))}

            <Button
              variant={"link"}
              textDecoration={"underline"}
              //  @ts-ignore
              onClick={() => append({ value: "", label: "" })}
              isDisabled={isEnergyStepCodeDependency}
            >
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
  [ERequirementType.generalContact]: function <TFieldValues>({
    editableLabelProps,
    canAddMultipleContactProps,
    ...rest
  }: TRequirementEditProps<TFieldValues>) {
    const contactFieldItemTypes: Array<{ type: ERequirementContactFieldItemType; containerProps?: BoxProps }> = [
      { type: ERequirementContactFieldItemType.firstName },
      { type: ERequirementContactFieldItemType.lastName },
      { type: ERequirementContactFieldItemType.email },
      { type: ERequirementContactFieldItemType.phone },
      {
        type: ERequirementContactFieldItemType.address,
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
      { type: ERequirementContactFieldItemType.organization },
    ]

    if (!canAddMultipleContactProps) {
      import.meta.env.DEV && console.error("canAddMultipleContactProps is required for contact requirement edit")
      return null
    }

    return (
      <GenericContactEdit<TFieldValues>
        requirementType={ERequirementType.generalContact}
        contactFieldItems={contactFieldItemTypes}
        editableLabelProps={editableLabelProps}
        {...canAddMultipleContactProps}
        {...rest}
      />
    )
  },

  [ERequirementType.professionalContact]: function <TFieldValues>({
    editableLabelProps,
    canAddMultipleContactProps,
    ...rest
  }: TRequirementEditProps<TFieldValues>) {
    if (!canAddMultipleContactProps) {
      import.meta.env.DEV && console.error("multipleContactProps is required for contact requirement edit")
      return null
    }

    const contactFieldItemTypes: Array<{ type: ERequirementContactFieldItemType; containerProps?: BoxProps }> = [
      { type: ERequirementContactFieldItemType.firstName },
      { type: ERequirementContactFieldItemType.lastName },
      { type: ERequirementContactFieldItemType.email },
      { type: ERequirementContactFieldItemType.phone },
      {
        type: ERequirementContactFieldItemType.address,
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
      { type: ERequirementContactFieldItemType.professionalAssociation },
      { type: ERequirementContactFieldItemType.professionalNumber },
      { type: ERequirementContactFieldItemType.organization },
    ]
    return (
      <GenericContactEdit<TFieldValues>
        requirementType={ERequirementType.professionalContact}
        contactFieldItems={contactFieldItemTypes}
        editableLabelProps={editableLabelProps}
        {...canAddMultipleContactProps}
        {...rest}
      />
    )
  },

  [ERequirementType.pidInfo]: function <TFieldValues>({ editableLabelProps, ...rest }) {
    const pidInfoFieldItemTypes: Array<{
      type: ERequirementType
      key: string
      label: string
      containerProps?: BoxProps
    }> = [
      { type: ERequirementType.text, key: "pid", label: "PID" }, //pid or pin?
      { type: ERequirementType.text, key: "folio_number", label: "Folio Number" }, //folio
      {
        type: ERequirementType.address,
        key: "address",
        label: "Address",
        containerProps: {
          gridColumn: "1 / span 2",
          sx: {
            ".chakra-form-control input": {
              maxW: "full",
            },
          },
        },
      },
    ]
    return (
      <PidInfoEdit<TFieldValues>
        requirementType={ERequirementType.pidInfo}
        fieldItems={pidInfoFieldItemTypes}
        editableLabelProps={editableLabelProps}
        {...rest}
      />
    )
  },
}

type TProps<TFieldValues> = {
  requirementType: ERequirementType
} & TRequirementEditProps<TFieldValues>

export const RequirementFieldEdit = observer(function RequirementFieldEdit<TFieldValues>({
  requirementType,
  ...rest
}: TProps<TFieldValues>) {
  // removing unnecessary props based on requirement type, to prevent
  // passing them to dom
  const propsToRemove = (() => {
    let toRemove = []

    if (requirementType !== ERequirementType.number) {
      toRemove.push("unitSelectProps")
    }

    if (!isMultiOptionRequirement(requirementType)) {
      toRemove.push("multiOptionProps")
    }

    if (!isContactRequirement(requirementType)) {
      toRemove.push("canAddMultipleContactProps")
    }

    return toRemove
  })()
  const formattedProps = R.omit(propsToRemove, rest)
  return requirementsComponentMap[requirementType]?.(formattedProps) ?? null
})

export function hasRequirementFieldEditComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}
