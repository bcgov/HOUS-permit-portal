import { Box, Button, Flex, FormControl, FormLabel, IconButton, Input, Stack, Text } from "@chakra-ui/react"
import { Pencil, Plus, X } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useJurisdiction } from "../../../../../../../hooks/resources/use-jurisdiction"
import { IPermitTypeRequiredStep } from "../../../../../../../types/types"
import { generateUUID } from "../../../../../../../utils/utility-functions"
import { CustomMessageBox } from "../../../../../../shared/base/custom-message-box"
import { ErrorScreen } from "../../../../../../shared/base/error-screen"
import { EditableBlockContainer, EditableBlockHeading } from "../../shared/editable-block"
import { i18nPrefix } from "../i18n-prefix"
import { EnergyStepSelect } from "./energy-step-select"
import { ZeroCarbonStepSelect } from "./zero-carbon-step-select"

interface IProps {
  heading: string
  permitTypeId: string
  fields: IPermitTypeRequiredStep[]
  fieldArrayName: string
  append: any
  remove: any
  update: any
  getIndex: (field: IPermitTypeRequiredStep) => number
  reset: () => any
}

export const EnergyStepEditableBlock = observer(function EnergyStepEditableBlock({
  heading,
  permitTypeId,
  fields,
  fieldArrayName,
  reset,
  append,
  remove,
  update,
  getIndex,
}: IProps) {
  const isCustomizingDefault = () => {
    return fields.length > 1 || fields[0].energyStepRequired === 0 || fields[0].zeroCarbonStepRequired === 0
  }

  const [isEditing, setIsEditing] = useState(false)
  const [isCustomizing, setIsCustomizing] = useState(isCustomizingDefault())

  const { currentJurisdiction, error } = useJurisdiction()

  const getRequiredStep = currentJurisdiction?.getRequiredStep

  const { formState, trigger, getValues, setValue, control } = useFormContext()
  const { errors, isSubmitting, isSubmitted, isValid } = formState

  const handleClickCancel = () => {
    reset()
    setIsEditing(false)
  }

  const onAdd = () => {
    append({ permitTypeId, energyStepRequired: null, zeroCarbonStepRequired: null })
  }

  const onRemove = (index: number, rs?: IPermitTypeRequiredStep) => {
    if (index === unremovableIndex) return
    if (rs) {
      update(index, { _destroy: true, id: rs.id })
    } else {
      remove(index)
    }
  }

  const onRemoveArray = (objectsWithIndecies: IIndexAndRequiredStep[]) => {
    const updateParams = []
    const removeIndecies = []
    objectsWithIndecies.forEach((obj) => {
      const { trueIndex: index, requiredStep: rs } = obj
      if (index === unremovableIndex) return
      if (rs) {
        updateParams.push([index, { _destroy: true, id: rs.id }])
      } else {
        removeIndecies.push(index)
      }
    })
    remove(removeIndecies)
    updateParams.forEach((arr) => update(...arr))
  }

  useEffect(() => {
    isSubmitted && setIsEditing(false)
  }, [isSubmitted])

  useEffect(() => {
    !!!isEditing && isSubmitted && reset()
  }, [isEditing])

  useEffect(() => {
    isEditing && trigger()
  }, [isEditing, fields.length])

  const handleClickDeleteCustomization = () => {
    const objectsWithIndecies = fields.map((f) => getTrueIndexAndObjectFromField(f))
    onRemoveArray(objectsWithIndecies)
    setIsCustomizing(false)
  }

  const unremovableIndex = getIndex(fields[0])

  interface IIndexAndRequiredStep {
    trueIndex: number
    requiredStep: IPermitTypeRequiredStep
  }

  const getTrueIndexAndObjectFromField = (field): IIndexAndRequiredStep => {
    const trueIndex = getIndex(field)
    const requiredStepId = getValues(`${fieldArrayName}.${trueIndex}.id`)
    const requiredStep = requiredStepId && getRequiredStep && getRequiredStep(requiredStepId)

    return { trueIndex, requiredStep }
  }

  return error ? (
    <ErrorScreen error={error} />
  ) : (
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
          <Flex gap={4}>
            <Flex gap={14} flex={1}>
              <FormControl w="50%">
                <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  name={`${fieldArrayName}.${unremovableIndex}.energyStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <EnergyStepSelect
                        onChange={onChange}
                        value={value}
                        showFirstOnly={isCustomizing}
                        isDisabled={!isEditing || isCustomizing}
                      />
                    )
                  }}
                />
              </FormControl>
              <FormControl w="50%">
                <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</FormLabel>
                <Controller
                  control={control}
                  rules={{ required: true }}
                  name={`${fieldArrayName}.${unremovableIndex}.zeroCarbonStepRequired`}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <ZeroCarbonStepSelect
                        onChange={onChange}
                        value={value}
                        showFirstOnly={isCustomizing}
                        isDisabled={!isEditing || isCustomizing}
                      />
                    )
                  }}
                />
              </FormControl>
            </Flex>
            <Box w={10} />
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
            {fields.map((f, index) => {
              const { trueIndex, requiredStep } = getTrueIndexAndObjectFromField(f)
              return (
                <React.Fragment key={f.id || generateUUID()}>
                  <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.id`} value={requiredStep?.id} />
                  <Input type="hidden" name={`${fieldArrayName}.${trueIndex}.permitTypeId`} value={permitTypeId} />
                  <Flex gap={4}>
                    <Flex gap={4} flex={1}>
                      <FormControl flex={1}>
                        <FormLabel noOfLines={1}>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
                        <Controller
                          control={control}
                          rules={{ required: true }}
                          name={`${fieldArrayName}.${trueIndex}.energyStepRequired`}
                          render={({ field: { onChange, value } }) => {
                            return (
                              <EnergyStepSelect onChange={onChange} value={value} isDisabled={!isEditing} allowZero />
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
                          rules={{ required: true }}
                          name={`${fieldArrayName}.${trueIndex}.zeroCarbonStepRequired`}
                          render={({ field: { onChange, value } }) => {
                            return (
                              <ZeroCarbonStepSelect
                                onChange={onChange}
                                value={value}
                                isDisabled={!isEditing}
                                allowZero
                              />
                            )
                          }}
                        />
                      </FormControl>
                    </Flex>
                    {isEditing && trueIndex !== unremovableIndex ? (
                      <IconButton
                        alignSelf="flex-end"
                        variant="ghost"
                        icon={<X />}
                        onClick={() => onRemove(trueIndex, requiredStep)}
                        aria-label={"remove customization"}
                      />
                    ) : (
                      <Box w={10} />
                    )}
                  </Flex>
                  <Text fontWeight="bold" textTransform="uppercase" my={2}>
                    {index !== fields.length - 1 && t("ui.or")}
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
            <Button variant="secondary" onClick={() => setIsCustomizing(true)}>
              {t("ui.customize")}
            </Button>
          )
        )}
      </Flex>
      {isEditing ? (
        <Stack direction={{ base: "column", lg: "row" }} alignSelf="start">
          <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting || !isValid}>
            {t("ui.onlySave")}
          </Button>
          <Button variant="secondary" onClick={handleClickCancel} isDisabled={isSubmitting}>
            {t("ui.cancel")}
          </Button>
        </Stack>
      ) : (
        <Button alignSelf="start" variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
          {t("ui.edit")}
        </Button>
      )}
    </EditableBlockContainer>
  )
})
