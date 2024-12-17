import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { ErrorMessage } from "@hookform/error-message"
import { Plus } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form"
import { Trans } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../../hooks/resources/use-part-3-step-code"
import { EFuelType } from "../../../../../../types/enums"
import { CustomMessageBox } from "../../../../../shared/base/custom-message-box"
import { GridColumnHeader } from "../../../part-9/checklist/shared/grid/column-header"
import { SectionHeading } from "../shared/section-heading"
import { MUAFuelRow } from "./mua-fuel"
import { SuiteSubMeteringFields } from "./suite-sub-metering"

export const ResidentialAdjustments = observer(function Part3StepCodeFormResidentialAdjustments() {
  const { checklist } = usePart3StepCode()
  const i18nPrefix = "stepCode.part3.residentialAdjustments"

  const navigate = useNavigate()
  const location = useLocation()

  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: {
      pressurizedDoorsCount: checklist.pressurizedDoorsCount,
      pressurizationAirflowPerDoor: parseFloat(checklist.pressurizationAirflowPerDoor),
      pressurizedCorridorsArea: parseFloat(checklist.pressurizedCorridorsArea),
      isSuiteSubMetered: checklist.isSuiteSubMetered,
      suiteHeatingEnergy: parseFloat(checklist.suiteHeatingEnergy),
      makeUpAirFuelsAttributes: checklist.makeUpAirFuels.map((muaFuel) => ({
        id: muaFuel.id,
        _destroy: null,
        fuelTypeId: muaFuel.fuelTypeId,
        percentOfLoad: parseFloat(muaFuel.percentOfLoad as string),
      })),
    },
  })
  const { handleSubmit, formState, register, control, reset, resetField, watch, getValues } = formMethods
  const { isSubmitting, isValid, isSubmitted, errors } = formState
  const { fields, replace, append, remove } = useFieldArray({
    control,
    rules: {
      validate: (value, formValues) => {
        const isMixture = value.length > 1
        let error
        if (!isMixture) {
          const isSelected = value.length == 1 && !!value[0].fuelTypeId
          error = !isSelected && t(`${i18nPrefix}.muaFuel.mixture.required`)
        } else if (R.all((v) => !!v.percentOfLoad, value)) {
          const totalPercentage = value.reduce((sum, muaFuel) => sum + Number(muaFuel.percentOfLoad), 0)
          error = totalPercentage != 100 && t(`${i18nPrefix}.muaFuel.mixture.totalPercentOfLoad.error`)
        } else {
          error = null
        }
        return !!error ? error : true
      },
    },
    name: "makeUpAirFuelsAttributes",
  })
  const watchMuaFuels = watch("makeUpAirFuelsAttributes")

  const onSubmit = async (values) => {
    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("residentialAdjustments")
      navigate(location.pathname.replace("residential-adjustments", "document-references"))
    }
  }

  useEffect(() => {
    if (isSubmitted) {
      // reset form state to prevent message box from showing again until form is resubmitted
      reset(undefined, { keepDirtyValues: true, keepErrors: true })
    }
  }, [isValid])

  return (
    <>
      <Flex direction="column" gap={2} pb={6}>
        {!isValid && isSubmitted && <CustomMessageBox title={t("stepCode.part3.errorTitle")} status="error" />}
        <SectionHeading>{t(`${i18nPrefix}.heading`)}</SectionHeading>
      </Flex>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.hdd.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.hdd.hint`)}
              </FormHelperText>
              <Input maxW={"200px"} value={checklist.heatingDegreeDays} isDisabled />
            </FormControl>
            <FormControl>
              <FormLabel>{t(`${i18nPrefix}.pressurizedDoors.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="pressurizedDoorsCount" />
              </FormHelperText>
              <Input
                maxW={"200px"}
                type="number"
                step={1}
                {...register("pressurizedDoorsCount", { required: t(`${i18nPrefix}.pressurizedDoors.error`) })}
              />
            </FormControl>
            <FormControl>
              <FormLabel pb={1}>{t(`${i18nPrefix}.airflow.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="pressurizedCorridorsArea" />
              </FormHelperText>
              <Input
                maxW={"200px"}
                type="number"
                step={"any"}
                {...register("pressurizedCorridorsArea", { required: t(`${i18nPrefix}.airflow.error`) })}
              />
            </FormControl>
            <FormControl>
              <FormLabel pb={1}>
                <Trans i18nKey={`${i18nPrefix}.area.label`} components={{ sup: <sup /> }} />
              </FormLabel>
              <FormHelperText mb={1} mt={0}>
                {t(`${i18nPrefix}.area.hint`)}
              </FormHelperText>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                <ErrorMessage errors={errors} name="pressurizationAirflowPerDoor" />
              </FormHelperText>
              <Input
                maxW={"200px"}
                type="number"
                step={"any"}
                {...register("pressurizationAirflowPerDoor", { required: t(`${i18nPrefix}.area.error`) })}
              />
            </FormControl>
            <FormControl>
              <FormLabel pb={1}>{t(`${i18nPrefix}.muaFuel.label`)}</FormLabel>
              <FormHelperText mb={1} mt={0} color="semantic.error">
                {fields.length <= 1 && <ErrorMessage errors={errors} name="makeUpAirFuelsAttributes.root" />}
              </FormHelperText>
              <Controller
                name="makeUpAirFuelsAttributes.0.fuelTypeId"
                control={control}
                rules={{ required: fields.length > 1 && t(`${i18nPrefix}.muaFuel.error`) }}
                render={() => {
                  const [value, setValue] = useState()
                  const defaultValue =
                    fields.length == 1 ? fields[0].fuelTypeId : fields.length > 1 ? "muaMixture" : undefined
                  const handleChange = (value) => {
                    if (value == "muaMixture" && fields.length <= 1) {
                      replace([
                        { id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined },
                        { id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined },
                      ])
                    } else {
                      resetField("makeUpAirFuelsAttributes")
                      replace([{ id: undefined, _destroy: undefined, fuelTypeId: value, percentOfLoad: 100 }])
                    }
                    setValue(value)
                  }
                  return (
                    <RadioGroup defaultValue={defaultValue} value={value} onChange={handleChange}>
                      <Stack spacing={1}>
                        {checklist.fuelTypes.map((ft) => (
                          <Radio key={ft.id} value={ft.id}>
                            {ft.key == EFuelType.other
                              ? ft.description
                              : t(`stepCode.part3.fuelTypes.fuelTypeKeys.${ft.key}`)}
                          </Radio>
                        ))}
                        <Radio key="muaMixture" value="muaMixture">
                          {t(`${i18nPrefix}.muaFuel.mixture.option`)}
                        </Radio>
                      </Stack>
                    </RadioGroup>
                  )
                }}
              />
            </FormControl>
            {fields.length > 1 && (
              <FormControl>
                <Grid
                  w="full"
                  templateColumns={`auto repeat(2, minmax(auto, 170px))`}
                  borderWidth={1}
                  borderTopWidth={0}
                  borderColor="borders.light"
                >
                  <GridColumnHeader>
                    <Text>{t(`${i18nPrefix}.muaFuel.mixture.fuelType.label`)}</Text>
                  </GridColumnHeader>
                  <GridColumnHeader>
                    <Text>
                      <Trans i18nKey={`${i18nPrefix}.muaFuel.mixture.emissionsFactor`} components={{ sub: <sub /> }} />
                    </Text>
                  </GridColumnHeader>
                  <GridColumnHeader>
                    <Text>{t(`${i18nPrefix}.muaFuel.mixture.percentOfLoad.label`)}</Text>
                  </GridColumnHeader>

                  {fields.map((f, idx) => {
                    return (
                      !getValues(`makeUpAirFuelsAttributes.${idx}._destroy`) && (
                        <MUAFuelRow key={f.id} field={f} idx={idx} remove={remove} />
                      )
                    )
                  })}
                </Grid>
                <FormHelperText color="semantic.error">
                  {R.all((f) => !!f.fuelTypeId && !!f.percentOfLoad, watchMuaFuels) && (
                    <ErrorMessage errors={errors} name={"makeUpAirFuelsAttributes.root"} />
                  )}
                </FormHelperText>
                {fields.length < checklist.fuelTypes.length && (
                  <Button
                    variant="link"
                    leftIcon={<Plus />}
                    onClick={() =>
                      append({ id: undefined, _destroy: undefined, fuelTypeId: undefined, percentOfLoad: undefined })
                    }
                  >
                    {t(`${i18nPrefix}.muaFuel.mixture.add`)}
                  </Button>
                )}
              </FormControl>
            )}
            <SuiteSubMeteringFields />
            <Button type="submit" variant="primary" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("stepCode.part3.cta")}
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </>
  )
})
