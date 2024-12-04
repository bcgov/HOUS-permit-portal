import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
} from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useLocation, useNavigate } from "react-router-dom"
import { usePart3StepCode } from "../../../../../hooks/resources/use-part-3-step-code"
import { EClimateZone } from "../../../../../types/enums"

export const LocationDetails = observer(function Part3StepCodeFormLocationDetails() {
  const i18nPrefix = "stepCode.part3.locationDetails"
  const { checklist } = usePart3StepCode()

  const navigate = useNavigate()
  const location = useLocation()

  const { handleSubmit, formState, register, control } = useForm({
    defaultValues: {
      buildingHeight: checklist.buildingHeight,
      heatingDegreeDays: checklist.heatingDegreeDays,
      climateZone: checklist.climateZone,
    },
  })
  const { isLoading } = formState

  const onSubmit = async (values) => {
    const updated = await checklist.update(values)
    if (updated) {
      await checklist.completeSection("locationDetails")
    }

    navigate(location.pathname.replace("location-details", "baseline-occupancies"))
  }

  return (
    <Flex direction="column" gap={2}>
      <Flex direction="column" gap={2} pb={4}>
        <Heading as="h2" fontSize="2xl" variant="yellowline" pt={4} m={0}>
          {t(`${i18nPrefix}.heading`)}
        </Heading>
        <Text fontSize="md">{t(`${i18nPrefix}.instructions`)}</Text>
      </Flex>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={{ base: 6, xl: 6 }} pb={4}>
          <FormControl>
            <FormLabel>{t(`${i18nPrefix}.aboveGradeStories.label`)}</FormLabel>
            <FormHelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.aboveGradeStories.hint`)}
            </FormHelperText>
            <Input maxW={"200px"} type="number" step={1} {...register("buildingHeight")} />
          </FormControl>
          <FormControl>
            <FormLabel>{t(`${i18nPrefix}.hdd.label`)}</FormLabel>
            <FormHelperText mb={1} mt={0}>
              {t(`${i18nPrefix}.hdd.hint`)}
            </FormHelperText>
            <Input maxW={"200px"} type="number" {...register("heatingDegreeDays")} />
          </FormControl>
          <FormControl>
            <FormLabel pb={1}>{t(`${i18nPrefix}.climateZone`)}</FormLabel>
            <Controller
              name="climateZone"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RadioGroup defaultValue={value} onChange={onChange}>
                  <Stack spacing={1}>
                    {Object.values(EClimateZone).map((zone) => (
                      <Radio key={zone} value={zone}>
                        {t(`${i18nPrefix}.climateZones.${zone}`)}
                      </Radio>
                    ))}
                  </Stack>
                </RadioGroup>
              )}
            />
          </FormControl>
          <Button type="submit" variant="primary" isLoading={isLoading} isDisabled={isLoading}>
            {t(`${i18nPrefix}.cta`)}
          </Button>
        </Flex>
      </form>
    </Flex>
  )
})
