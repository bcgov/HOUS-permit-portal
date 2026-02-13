import {
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  Textarea,
} from "@chakra-ui/react"
import { CalendarBlank, Envelope, MapPin, Phone, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { Controller, FieldValues, useController, useFieldArray, useFormContext } from "react-hook-form"
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
import { MultiplySumGridPreview } from "../multiply-sum-grid-preview"
import { EditableGroup, TEditableGroupProps } from "./editable-group"
import { GenericContactEdit } from "./generic-contact-edit"
import { PidInfoEdit } from "./pid-info-edit"
import { IControlProps, TEditableInstructionsTextProps, TIsMultipleFilesCheckboxProps } from "./types"

export type TRequirementEditProps<TFieldValues extends FieldValues> = TEditableGroupProps<TFieldValues> & {
  unitSelectProps?: IControlProps<TFieldValues>
  editableInstructionsTextProps?: TEditableInstructionsTextProps<TFieldValues>
  multiOptionProps?: {
    useFieldArrayProps: UseFieldArrayProps<TFieldValues>
    onOptionValueChange: (optionIndex: number, optionValue: string) => void
    getOptionValue: (idx: number) => IOption | undefined
  }
  canAddMultipleContactProps?: IControlProps<TFieldValues>
  isMultipleFilesCheckboxProps?: TIsMultipleFilesCheckboxProps<TFieldValues>
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

  [ERequirementType.bcaddress]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
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

    const isLockedOptions =
      editableGroupProps.requirementCode === EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod

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
                  isDisabled={isLockedOptions}
                />
                <IconButton
                  aria-label={"remove option"}
                  variant={"unstyled"}
                  icon={<X />}
                  onClick={() => remove(idx)}
                  isDisabled={isLockedOptions}
                />
              </HStack>
            ))}

            {/*  @ts-ignore*/}
            <Button
              variant={"link"}
              textDecoration={"underline"}
              onClick={() => append({ value: "", label: "" })}
              isDisabled={isLockedOptions}
            >
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
          "& > div:nth-of-type(2)": {
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
      String(editableGroupProps.requirementCode) === EEnergyStepCodeDependencyRequirementCode.energyStepCodeMethod

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

  [ERequirementType.file]: function <TFieldValues>({
    isMultipleFilesCheckboxProps,
    ...props
  }: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()

    return (
      <EditableGroup
        editableInput={<i className="fa fa-cloud-upload"></i>}
        isMultipleFilesCheckboxProps={isMultipleFilesCheckboxProps}
        {...props}
      />
    )
  },

  [ERequirementType.energyStepCodePart9]: function <TFieldValues>(props) {
    return <EditableGroup editableInput={<i className="fa fa-bolt"></i>} {...props} />
  },

  [ERequirementType.energyStepCodePart3]: function <TFieldValues>(props) {
    return <EditableGroup editableInput={<i className="fa fa-bolt"></i>} {...props} />
  },

  [ERequirementType.architecturalDrawing]: function <TFieldValues>(props) {
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
      { type: ERequirementContactFieldItemType.contactType },
      {
        type: ERequirementContactFieldItemType.professionalNumber,
        containerProps: {
          gridColumn: "1 / span 2",
        },
      },
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

  [ERequirementType.pidInfo]: function <TFieldValues>({
    editableLabelProps,
    isOptionalCheckboxProps,
    controlProps,
    ...rest
  }) {
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
        isOptionalCheckboxProps={isOptionalCheckboxProps}
        controlProps={controlProps}
        {...rest}
      />
    )
  },

  [ERequirementType.multiplySumGrid]: function <TFieldValues>(props: TRequirementEditProps<TFieldValues>) {
    const { t } = useTranslation()
    const { control } = useFormContext<TFieldValues>()
    const editableLabelName = (props?.editableLabelProps?.controlProps as any)?.name as string | undefined
    const basePath = editableLabelName ? editableLabelName.replace(/\.label$/, "") : undefined

    const first = useController({
      control: control as any,
      name: `${basePath}.inputOptions.headers.firstColumn`,
      defaultValue: t("requirementsLibrary.multiplySumGrid.addHeaderPlaceholder"),
    })
    const a = useController({
      control: control as any,
      name: `${basePath}.inputOptions.headers.a`,
      defaultValue: t("requirementsLibrary.multiplySumGrid.addHeaderPlaceholder"),
    })

    const quantity = useController({
      control: control as any,
      name: `${basePath}.inputOptions.headers.quantity`,
      defaultValue: t("requirementsLibrary.multiplySumGrid.quantityB"),
    })

    const ab = useController({
      control: control as any,
      name: `${basePath}.inputOptions.headers.ab`,
      defaultValue: t("requirementsLibrary.multiplySumGrid.ab"),
    })

    const { fields, append, remove } = useFieldArray({
      control: control as any,
      name: `${basePath}.inputOptions.rows`,
    })

    return (
      <EditableGroup
        editableInput={
          <Stack spacing={3}>
            <MultiplySumGridPreview
              headers={{
                firstColumn: first.field.value as any,
                a: a.field.value as any,
                quantity: quantity.field.value as any,
                ab: ab.field.value as any,
              }}
              controls={{
                firstColumn: { value: first.field.value as any, onChange: first.field.onChange },
                a: { value: a.field.value as any, onChange: a.field.onChange },
                quantity: { value: quantity.field.value as any, onChange: quantity.field.onChange },
                ab: { value: ab.field.value as any, onChange: ab.field.onChange },
              }}
            />
            <Stack spacing={2}>
              <Grid templateColumns="2fr 2fr 1fr 1fr" gap={2}>
                {fields.map((row, idx) => (
                  <React.Fragment key={row.id}>
                    <GridItem>
                      <Controller
                        name={`${basePath}.inputOptions.rows.${idx}.name` as any}
                        control={control}
                        render={({ field }) => (
                          <Input
                            placeholder={`${t("requirementsLibrary.multiplySumGrid.itemPlaceholder")}`}
                            bg="white"
                            value={`${field.value ?? ""}`}
                            onChange={field.onChange}
                            w="100%"
                          />
                        )}
                      />
                    </GridItem>
                    <GridItem>
                      <Controller
                        name={`${basePath}.inputOptions.rows.${idx}.a` as any}
                        control={control}
                        render={({ field }) => (
                          <Input
                            placeholder={`${t("requirementsLibrary.multiplySumGrid.aPlaceholder")} (A)`}
                            type="number"
                            bg="white"
                            value={`${field.value ?? ""}`}
                            onChange={(e) => field.onChange(e.target.value === "" ? "" : Number(e.target.value))}
                            w="100%"
                          />
                        )}
                      />
                    </GridItem>
                    <GridItem display="flex" alignItems="right" justifyContent="flex-start">
                      <IconButton aria-label="Remove" icon={<X />} variant="ghost" onClick={() => remove(idx)} />
                    </GridItem>
                    <GridItem />
                  </React.Fragment>
                ))}
              </Grid>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => append({ name: "", a: "" } as any)}
                alignSelf="flex-start"
              >
                {t("requirementsLibrary.multiplySumGrid.addRow")}
              </Button>
            </Stack>
          </Stack>
        }
        {...props}
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

    if (requirementType !== ERequirementType.file) {
      toRemove.push("isMultipleFilesCheckboxProps")
    }

    return toRemove
  })()
  const formattedProps = R.omit(propsToRemove, rest)
  return requirementsComponentMap[requirementType]?.({ ...formattedProps, requirementType }) ?? null
})

export function hasRequirementFieldEditComponent(requirementType: ERequirementType): boolean {
  return !!requirementsComponentMap[requirementType]
}
