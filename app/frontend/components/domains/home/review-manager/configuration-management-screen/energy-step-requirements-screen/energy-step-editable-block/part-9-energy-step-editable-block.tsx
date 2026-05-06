import { Box, Button, Field, Flex, IconButton, Input, Text, VStack } from "@chakra-ui/react"
import { Pencil, Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../../models/jurisdiction"
import { EFlashMessageStatus } from "../../../../../../../types/enums"
import { IJurisdictionStepRequirement } from "../../../../../../../types/types"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../../../../shared/base/custom-message-box"
import { EditableBlockContainer, EditableBlockHeading } from "../../shared/editable-block"
import { i18nPrefix } from "../i18n-prefix"
import { EnergyStepSelect } from "./energy-step-select"
import { ZeroCarbonStepSelect } from "./zero-carbon-step-select"

interface IProps {
  heading: string
  jurisdiction: IJurisdiction
}

type TJurisdictionStepRequirementField = IJurisdictionStepRequirement & { _destroy?: boolean }

export const Part9EnergyStepEditableBlock = observer(function Part9EnergyStepEditableBlock({
  heading,
  jurisdiction,
}: IProps) {
  const getDefaultValues = () => {
    const steps = jurisdiction.part9RequiredSteps as TJurisdictionStepRequirementField[]
    if (R.isEmpty(steps)) {
      return {
        jurisdictionStepRequirementsAttributes: [
          { default: true, energyStepRequired: undefined, zeroCarbonStepRequired: undefined },
        ],
      }
    }
    return {
      jurisdictionStepRequirementsAttributes: [...steps],
    }
  }

  interface IFormValues {
    jurisdictionStepRequirementsAttributes: TJurisdictionStepRequirementField[]
  }
  const { handleSubmit, reset, formState, watch, register, control } = useForm<IFormValues>({
    mode: "onChange",
    defaultValues: getDefaultValues(),
  })

  const onSubmit = async (values) => {
    await jurisdiction.update(values)
    reset(getDefaultValues())
    setIsEditing(false)
  }

  const { isSubmitting, isValid } = formState
  const fieldArrayName = "jurisdictionStepRequirementsAttributes"
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
    keyName: "key",
  })

  const watchRequiredSteps = watch(fieldArrayName)

  const defaultFields = R.filter((f) => f.default, fields as TJurisdictionStepRequirementField[])
  const customFields = R.filter((f) => !f.default && !f._destroy, fields as TJurisdictionStepRequirementField[])
  const getIndex = (field) => R.findIndex((f) => f.key == field?.key, fields)

  const defaultIndex = Math.max(0, getIndex(R.find((f) => f.default, defaultFields)))

  const [isEditing, setIsEditing] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(!R.isEmpty(customFields))

  const handleClickCancel = () => {
    const defaultValues = getDefaultValues()
    reset(defaultValues)
    setIsEditing(false)
  }

  const onAdd = () => {
    append({ energyStepRequired: undefined, zeroCarbonStepRequired: undefined, default: false })
  }

  const onRemove = (index: number, field?: TJurisdictionStepRequirementField) => {
    if (field) {
      update(index, R.mergeRight(field, { _destroy: true }))
    } else {
      remove(index)
    }
  }

  const handleClickCustomize = () => {
    onAdd()
  }

  const handleClickDeleteCustomization = () => {
    customFields.forEach((f) => {
      const index = getIndex(f)
      onRemove(index, f)
    })
  }

  useEffect(() => {
    if (R.none((f) => !f.default && !f._destroy, watchRequiredSteps || [])) {
      setIsCustomizing(false)
    } else {
      setIsCustomizing(true)
    }
  }, [watchRequiredSteps])

  useEffect(() => {
    reset(getDefaultValues())
  }, [jurisdiction.id])

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
      <EditableBlockContainer w="full">
        <Flex direction="column" w="20%" alignSelf="flex-start">
          <Text textTransform="uppercase" color="text.secondary" fontSize="sm" mb={4}>
            {t(`${i18nPrefix}.stepRequired.tagsHeading`)}
          </Text>
          <EditableBlockHeading>{heading}</EditableBlockHeading>
        </Flex>
        <Flex flex={1} direction="column" gap={4}>
          <Flex
            direction="column"
            p={4}
            gap={4}
            flex={1}
            border="1px solid"
            borderColor="border.light"
            borderRadius="md"
            bg={isEditing && !isCustomizing ? "greys.white" : "transparent"}
          >
            <Text fontWeight="bold">{t(`${i18nPrefix}.stepRequired.standardToPass`)}</Text>
            <Flex gap={14} flex={1}>
              <Input type="hidden" {...register(`${fieldArrayName}.${defaultIndex}.id`)} />
              <Input type="hidden" {...register(`${fieldArrayName}.${defaultIndex}.default`)} />
              <Field.Root>
                <Field.Label lineClamp={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</Field.Label>
                <Controller
                  control={control}
                  rules={{ required: !isCustomizing }}
                  name={`${fieldArrayName}.${defaultIndex}.energyStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return <EnergyStepSelect onChange={onChange} value={value} disabled={!isEditing || isCustomizing} />
                  }}
                />
              </Field.Root>
              <Field.Root>
                <Field.Label lineClamp={1}>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</Field.Label>
                <Controller
                  control={control}
                  rules={{ required: !isCustomizing }}
                  name={`${fieldArrayName}.${defaultIndex}.zeroCarbonStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <ZeroCarbonStepSelect
                        onChange={onChange}
                        value={value}
                        disabled={!isEditing || isCustomizing}
                        portal
                      />
                    )
                  }}
                />
              </Field.Root>
            </Flex>
            {isCustomizing && (
              <CustomMessageBox
                status={EFlashMessageStatus.warning}
                description={t(`${i18nPrefix}.overriddenWarning`)}
                p={1}
              />
            )}
          </Flex>

          {isCustomizing ? (
            <Flex
              direction="column"
              p={4}
              gap={1}
              flex={1}
              border="1px solid"
              borderColor="border.light"
              borderRadius="md"
              bg={isEditing ? "greys.white" : "transparent"}
            >
              <Text fontWeight="bold" mb={3}>
                {t(`${i18nPrefix}.stepRequired.customizedMinimum`)}
              </Text>
              {R.filter((f) => !f._destroy, customFields).map((f, index) => {
                const trueIndex = getIndex(f)
                return (
                  <React.Fragment key={f.id || generateUUID()}>
                    <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={f?.id || ""} />
                    <Flex gap={4}>
                      <Flex gap={4} flex={1}>
                        <Field.Root flex={1}>
                          <Field.Label lineClamp={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</Field.Label>
                          <Controller
                            control={control}
                            rules={{ validate: (value) => value !== undefined }}
                            name={`${fieldArrayName}.${trueIndex}.energyStepRequired`}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <EnergyStepSelect onChange={onChange} value={value} disabled={!isEditing} allowNull />
                              )
                            }}
                          />
                        </Field.Root>
                        <Text color="text.secondary" fontStyle="italic" alignSelf="flex-end" mb={2}>
                          {t("ui.and")}
                        </Text>
                        <Field.Root flex={1}>
                          <Field.Label lineClamp={1}>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</Field.Label>
                          <Controller
                            control={control}
                            rules={{ validate: (value) => value !== undefined }}
                            name={`${fieldArrayName}.${trueIndex}.zeroCarbonStepRequired`}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <ZeroCarbonStepSelect
                                  onChange={onChange}
                                  value={value}
                                  disabled={!isEditing}
                                  allowNull
                                  portal
                                />
                              )
                            }}
                          />
                        </Field.Root>
                      </Flex>
                      {isEditing && customFields.length > 1 ? (
                        <IconButton
                          alignSelf="flex-end"
                          variant="ghost"
                          onClick={() => onRemove(trueIndex, f)}
                          aria-label={"remove customization"}
                        >
                          <X />
                        </IconButton>
                      ) : (
                        <Box w={10} />
                      )}
                    </Flex>
                    <Text fontWeight="bold" textTransform="uppercase" my={2}>
                      {index !== customFields.length - 1 && t("ui.or")}
                    </Text>
                  </React.Fragment>
                )
              })}
              {isEditing && (
                <Flex w="full" justify="space-between">
                  <Button size="sm" variant="primary" onClick={onAdd}>
                    <Plus />
                    {t(`${i18nPrefix}.addStep`)}
                  </Button>

                  <Button size="sm" variant="plain" color="semantic.error" onClick={handleClickDeleteCustomization}>
                    <X />
                    {t(`${i18nPrefix}.deleteCustomization`)}
                  </Button>
                </Flex>
              )}
            </Flex>
          ) : (
            isEditing && (
              <Button variant="secondary" onClick={handleClickCustomize}>
                {t("ui.customize")}
              </Button>
            )
          )}
        </Flex>
        {isEditing ? (
          <VStack alignSelf="start">
            <Button variant="primary" w="full" type="submit" loading={isSubmitting} disabled={isSubmitting || !isValid}>
              {t("ui.onlySave")}
            </Button>
            <Button variant="secondary" w="full" onClick={handleClickCancel} disabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </VStack>
        ) : (
          <Button alignSelf="start" variant="primary" onClick={() => setIsEditing(true)}>
            <Pencil />
            {t("ui.edit")}
          </Button>
        )}
      </EditableBlockContainer>
    </form>
  )
})
