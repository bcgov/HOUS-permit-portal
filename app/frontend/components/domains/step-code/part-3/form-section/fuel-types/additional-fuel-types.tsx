import { RadioGroup } from "@/components/ui/radio"
import { Field, Flex, Heading, Input, Link, Stack, Text } from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import { remove } from "ramda"
import React, { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFlashMessageStatus, EFuelType } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { Part3FormFooter } from "../shared/form-footer"

const i18nPrefix = "stepCode.part3.additionalFuelTypes"

export const AdditionalFuelTypes = observer(function Part3StepCodeFormAdditionalFuelTypes() {
  const { checklist } = usePart3StepCode()

  const formMethods = useForm({
    defaultValues: {
      fuelTypesAttributes: checklist.otherFuelTypes.map((ft) => ({
        id: ft.id,
        key: ft.key,
        description: ft.description,
        emissionsFactor: ft.emissionsFactor,
        source: ft.source,
      })),
    },
  })
  const { handleSubmit, formState, reset, control } = formMethods

  const { isSubmitting, isValid, isSubmitted } = formState

  const { fields, append } = useFieldArray({
    control,
    name: "fuelTypesAttributes",
  })

  const onAdd = () => {
    append({ id: null, key: EFuelType.other, description: null, emissionsFactor: null, source: null })
  }

  const onSubmit = async (values) => {
    if (!checklist) return
    const updated = await checklist.update(values)
    if (!updated) throw new Error("Save failed")
    await checklist.completeSection("additionalFuelTypes")
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2}>
        {!isValid && isSubmitted && (
          <CustomMessageBox title={t("stepCode.part3.errorTitle")} status={EFlashMessageStatus.error} />
        )}
        <Flex direction="column" gap={2} pb={4}>
          <Heading as="h2" fontSize="2xl" variant="yellowline" pt={4} m={0}>
            {t(`${i18nPrefix}.heading`)}
          </Heading>
          <Text fontSize="md">
            <Trans
              i18nKey={`${i18nPrefix}.instructions`}
              components={{
                br: <br />,
                download: (
                  <Link
                    href="https://publications.gc.ca/collections/collection_2022/eccc/En81-4-2020-2-eng.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ),
              }}
            />
          </Text>
        </Flex>
      </Flex>
      <FormProvider {...formMethods}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          {fields.map((field, idx) => (
            <OtherFuelTypeFields field={field} idx={idx} onAdd={onAdd} />
          ))}

          <Part3FormFooter handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
        </Flex>
      </FormProvider>
    </>
  )
})

const OtherFuelTypeFields = ({ field, onAdd, idx }) => {
  const { formState, register } = useFormContext()
  const { errors } = formState

  const [addMore, setAddMore] = useState("no")

  const handleChangeAddMore = (value) => {
    setAddMore(value)
    if (value == "yes") {
      onAdd()
    } else if (idx > 0) {
      remove(idx - 1)
    }
  }

  return (
    <>
      <Field.Root>
        <Field.Label>{t(`${i18nPrefix}.description.label`)}</Field.Label>
        <Field.HelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.description.hint`)}
        </Field.HelperText>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.description`} />
        </Field.HelperText>
        <Input
          key={field.id}
          maxW={"430px"}
          {...register(`fuelTypesAttributes.${idx}.description`, {
            required: t(`${i18nPrefix}.description.error`),
          })}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>
          <Trans i18nKey={`${i18nPrefix}.emissionsFactor.label`} components={{ sub: <sub /> }} />
        </Field.Label>
        <Field.HelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.emissionsFactor.hint`)}
        </Field.HelperText>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.emissionsFactor`} />
        </Field.HelperText>
        <Input
          key={field.id}
          maxW={"200px"}
          type="number"
          step="any"
          {...register(`fuelTypesAttributes.${idx}.emissionsFactor`, {
            required: t(`${i18nPrefix}.emissionsFactor.error`),
          })}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t(`${i18nPrefix}.source.label`)}</Field.Label>
        <Field.HelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.source.hint`)}
        </Field.HelperText>
        <Field.HelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.source`} />
        </Field.HelperText>
        <Input
          key={field.id}
          maxW={"430px"}
          {...register(`fuelTypesAttributes.${idx}.source`, {
            required: t(`${i18nPrefix}.source.error`),
          })}
        />
      </Field.Root>
      <Field.Root>
        <Field.Label>{t(`${i18nPrefix}.addMore.label`)}</Field.Label>
        <RadioGroup.Root onValueChange={handleChangeAddMore} value={addMore}>
          <Stack gap={5} direction="row">
            <RadioGroup.Item variant="binary" value={"yes"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.yes")}</RadioGroup.ItemText>
            </RadioGroup.Item>
            <RadioGroup.Item variant="binary" value={"no"}>
              <RadioGroup.ItemHiddenInput />
              <RadioGroup.ItemIndicator />
              <RadioGroup.ItemText>{t("ui.no")}</RadioGroup.ItemText>
            </RadioGroup.Item>
          </Stack>
        </RadioGroup.Root>
      </Field.Root>
    </>
  )
}
