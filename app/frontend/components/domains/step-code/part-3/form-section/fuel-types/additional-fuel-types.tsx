import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Link,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import { remove } from "ramda"
import React, { useEffect, useState } from "react"
import { FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFuelType } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"

const i18nPrefix = "stepCode.part3.additionalFuelTypes"

export const AdditionalFuelTypes = observer(function Part3StepCodeFormAdditionalFuelTypes() {
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

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

    const alternatePath = checklist.alternateNavigateAfterSavePath
    checklist.setAlternateNavigateAfterSavePath(null)

    if (!isValid) return
    const updated = await checklist.update(values)

    if (updated) {
      await checklist.completeSection("additionalFuelTypes")

      if (alternatePath) {
        navigate(alternatePath)
      } else {
        navigate(location.pathname.replace("additional-fuel-types", "baseline-performance"))
      }
    } else {
      return
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2}>
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
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
                    isExternal
                  />
                ),
              }}
            />
          </Text>
        </Flex>
      </Flex>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} name="part3SectionForm">
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            {fields.map((field, idx) => (
              <OtherFuelTypeFields field={field} idx={idx} onAdd={onAdd} />
            ))}

            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          </Flex>
        </form>
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
      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.description.label`)}</FormLabel>
        <FormHelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.description.hint`)}
        </FormHelperText>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.description`} />
        </FormHelperText>
        <Input
          key={field.id}
          maxW={"430px"}
          {...register(`fuelTypesAttributes.${idx}.description`, {
            required: t(`${i18nPrefix}.description.error`),
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>
          <Trans i18nKey={`${i18nPrefix}.emissionsFactor.label`} components={{ sub: <sub /> }} />
        </FormLabel>
        <FormHelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.emissionsFactor.hint`)}
        </FormHelperText>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.emissionsFactor`} />
        </FormHelperText>
        <Input
          key={field.id}
          maxW={"200px"}
          type="number"
          step="any"
          {...register(`fuelTypesAttributes.${idx}.emissionsFactor`, {
            required: t(`${i18nPrefix}.emissionsFactor.error`),
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.source.label`)}</FormLabel>
        <FormHelperText mb={1} mt={0}>
          {t(`${i18nPrefix}.source.hint`)}
        </FormHelperText>
        <FormHelperText mb={1} mt={0} color="semantic.error">
          <ErrorMessage errors={errors} name={`fuelTypesAttributes.${idx}.source`} />
        </FormHelperText>
        <Input
          key={field.id}
          maxW={"430px"}
          {...register(`fuelTypesAttributes.${idx}.source`, {
            required: t(`${i18nPrefix}.source.error`),
          })}
        />
      </FormControl>
      <FormControl>
        <FormLabel>{t(`${i18nPrefix}.addMore.label`)}</FormLabel>
        <RadioGroup onChange={handleChangeAddMore} value={addMore}>
          <Stack spacing={5} direction="row">
            <Radio variant="binary" value={"yes"}>
              {t("ui.yes")}
            </Radio>
            <Radio variant="binary" value={"no"}>
              {t("ui.no")}
            </Radio>
          </Stack>
        </RadioGroup>
      </FormControl>
    </>
  )
}
