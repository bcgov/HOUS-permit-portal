import { Box, Button, Flex, FormControl, FormLabel, IconButton, Input, Text, VStack } from "@chakra-ui/react"
import { Pencil, Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { IJurisdiction } from "../../../../../../../models/jurisdiction"
import { IPermitTypeRequiredStep } from "../../../../../../../types/types"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../../../../shared/base/custom-message-box"
import { EditableBlockContainer, EditableBlockHeading } from "../../shared/editable-block"
import { i18nPrefix } from "../i18n-prefix"
import { EnergyStepSelect } from "./energy-step-select"
import { ZeroCarbonStepSelect } from "./zero-carbon-step-select"

interface IProps {
  heading: string
  permitTypeId: string
  jurisdiction: IJurisdiction
}

export const EnergyStepEditableBlock = observer(function EnergyStepEditableBlock({
  heading,
  permitTypeId,
  jurisdiction,
}: IProps) {
  type TPermitTypeRequiredStepField = IPermitTypeRequiredStep & { _destroy?: boolean }
  const getDefaultValues = () => ({
    permitTypeRequiredStepsAttributes: [...(jurisdiction.permitTypeRequiredSteps as TPermitTypeRequiredStepField[])],
  })

  interface IFormValues {
    permitTypeRequiredStepsAttributes: TPermitTypeRequiredStepField[]
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
  const fieldArrayName = "permitTypeRequiredStepsAttributes"
  const { fields, append, insert, remove, update } = useFieldArray({
    control,
    name: fieldArrayName,
    keyName: "key",
  })
  const watchRequiredSteps = watch(fieldArrayName)

  const permitTypeFields = R.filter((f) => f.permitTypeId == permitTypeId, fields as TPermitTypeRequiredStepField[])
  const customFields = R.filter((f) => !f.default, permitTypeFields)
  const getIndex = (field) => R.findIndex((f) => f.key == field.key, fields)
  const defaultIndex = getIndex(R.find((f) => f.default, permitTypeFields))

  const [isEditing, setIsEditing] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(!R.isEmpty(customFields))

  const handleClickCancel = () => {
    const defaultValues = getDefaultValues()
    reset(defaultValues)
    setIsEditing(false)
  }

  const onAdd = () => {
    append({ permitTypeId, energyStepRequired: undefined, zeroCarbonStepRequired: undefined, default: null })
  }

  const onRemove = (index: number, field?: TPermitTypeRequiredStepField) => {
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
    if (R.none((f) => !f.default && !f._destroy && f.permitTypeId == permitTypeId, watchRequiredSteps)) {
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
      <EditableBlockContainer>
        <Flex direction="column" w="20%" alignSelf="flex-start">
          <Text textTransform="uppercase" color="text.secondary" fontSize="sm" mb={4}>
            {t(`${i18nPrefix}.stepRequired.permitTypeHeading`)}
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
              <Input type="hidden" {...register(`${fieldArrayName}.${defaultIndex}.permitTypeId`)} />
              <Input type="hidden" {...register(`${fieldArrayName}.${defaultIndex}.default`)} />
              <FormControl>
                <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  name={`${fieldArrayName}.${defaultIndex}.energyStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <EnergyStepSelect onChange={onChange} value={value} isDisabled={!isEditing || isCustomizing} />
                    )
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</FormLabel>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  name={`${fieldArrayName}.${defaultIndex}.zeroCarbonStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <ZeroCarbonStepSelect
                        onChange={onChange}
                        value={value}
                        isDisabled={!isEditing || isCustomizing}
                      />
                    )
                  }}
                />
              </FormControl>
            </Flex>
            {isCustomizing && (
              <CustomMessageBox status="warning" description={t(`${i18nPrefix}.overriddenWarning`)} p={1} />
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
                    <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={f?.id} />
                    <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.permitTypeId`} value={permitTypeId} />
                    <Flex gap={4}>
                      <Flex gap={4} flex={1}>
                        <FormControl flex={1}>
                          <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
                          <Controller
                            control={control}
                            rules={{ validate: (value) => value !== undefined }}
                            name={`${fieldArrayName}.${trueIndex}.energyStepRequired`}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <EnergyStepSelect onChange={onChange} value={value} isDisabled={!isEditing} allowNull />
                              )
                            }}
                          />
                        </FormControl>
                        <Text color="text.secondary" fontStyle="italic" alignSelf="flex-end" mb={2}>
                          {t("ui.and")}
                        </Text>
                        <FormControl flex={1}>
                          <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</FormLabel>
                          <Controller
                            control={control}
                            rules={{ validate: (value) => value !== undefined }}
                            name={`${fieldArrayName}.${trueIndex}.zeroCarbonStepRequired`}
                            render={({ field: { onChange, value } }) => {
                              return (
                                <ZeroCarbonStepSelect
                                  onChange={onChange}
                                  value={value}
                                  isDisabled={!isEditing}
                                  allowNull
                                />
                              )
                            }}
                          />
                        </FormControl>
                      </Flex>
                      {isEditing && customFields.length > 1 ? (
                        <IconButton
                          alignSelf="flex-end"
                          variant="ghost"
                          icon={<X />}
                          onClick={() => onRemove(trueIndex, f)}
                          aria-label={"remove customization"}
                        />
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
                  <Button size="sm" variant="primary" leftIcon={<Plus />} onClick={onAdd}>
                    {t(`${i18nPrefix}.addStep`)}
                  </Button>

                  <Button
                    size="sm"
                    variant="link"
                    color="semantic.error"
                    leftIcon={<X />}
                    onClick={handleClickDeleteCustomization}
                  >
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
            <Button
              variant="primary"
              w="full"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting || !isValid}
            >
              {t("ui.onlySave")}
            </Button>
            <Button variant="secondary" w="full" onClick={handleClickCancel} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </VStack>
        ) : (
          <Button alignSelf="start" variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
            {t("ui.edit")}
          </Button>
        )}
      </EditableBlockContainer>
    </form>
  )
})
