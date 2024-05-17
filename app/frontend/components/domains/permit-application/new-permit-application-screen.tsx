import {
  Box,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  Link,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import i18next from "i18next"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { BackButton } from "../../shared/buttons/back-button"
import { ActivityList } from "../../shared/permit-classification/activity-list"
import { PermitTypeRadioSelect } from "../../shared/permit-classification/permit-type-radio-select"
import { JurisdictionSelect } from "../../shared/select/selectors/jurisdiction-select"
import { SitesSelect } from "../../shared/select/selectors/sites-select"

export type TSearchAddressFormData = {
  addressString: string
}

interface INewPermitApplicationScreenProps {}

export type TCreatePermitApplicationFormData = {
  pid: string
  pin?: string
  permitTypeId: string
  activityId: string
  jurisdiction: IJurisdiction
  site?: IOption
}

export const NewPermitApplicationScreen = observer(({}: INewPermitApplicationScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm<TCreatePermitApplicationFormData>({
    mode: "onChange",
    defaultValues: {
      pid: "",
      pin: "",
      permitTypeId: "",
      activityId: "",
      site: null as IOption,
      jurisdiction: null as IJurisdiction,
    },
  })
  const { handleSubmit, formState, control, watch, register, setValue } = formMethods
  const { isSubmitting } = formState
  const { permitClassificationStore, permitApplicationStore, geocoderStore } = useMst()
  const { fetchGeocodedJurisdiction } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions } = permitClassificationStore
  const navigate = useNavigate()

  const [pinMode, setPinMode] = useState(false)

  const onSubmit = async (formValues) => {
    const params = {
      ...formValues,
      fullAddress: formValues.site.label,
      jurisdictionId: formValues.jurisdiction.id,
    }
    const permitApplication = await permitApplicationStore.createPermitApplication(params)
    if (permitApplication) {
      navigate(`/permit-applications/${permitApplication.id}/edit`)
    }
  }

  const permitTypeIdWatch = watch("permitTypeId")
  const pidWatch = watch("pid")
  const pinWatch = watch("pin")
  const siteWatch = watch("site")
  const jurisdictionWatch = watch("jurisdiction")

  useEffect(() => {
    if (R.isNil(siteWatch?.value) && !pidWatch) return

    if (siteWatch?.value == "") {
      setPinMode(true)
      setValue("jurisdiction", null)
      return
    }

    ;(async () => {
      const jurisdiction = await fetchGeocodedJurisdiction(siteWatch?.value, pidWatch)
      if (jurisdiction && !R.isEmpty(jurisdiction)) {
        setPinMode(false)
        setValue("jurisdiction", jurisdiction)
      } else {
        setPinMode(true)
        setValue("jurisdiction", null)
      }
    })()
  }, [siteWatch?.value, pidWatch])

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      <BlueTitleBar title={t("permitApplication.start")} />
      <Container maxW="container.lg" py={8}>
        <DisclaimerInfo />
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...formMethods}>
            <Flex direction="column" gap={12} w="full" bg="greys.white">
              <Flex as="section" direction="column" gap={4}>
                <Heading as="h2" variant="yellowline">
                  {t("permitApplication.new.locationHeading")}
                </Heading>
                <Controller
                  name="site"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <SitesSelect
                        onChange={onChange}
                        placeholder={undefined}
                        selectedOption={value}
                        styles={{
                          container: (css, state) => ({
                            ...css,
                            width: "100%",
                          }),
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        menuPortalTarget={document.body}
                      />
                    )
                  }}
                />
                {pinMode && <PinModeInputs />}
              </Flex>
              {jurisdictionWatch && (pidWatch || pinWatch) && (
                <Flex as="section" direction="column" gap={2}>
                  <Heading as="h2" variant="yellowline">
                    {t("permitApplication.new.permitTypeHeading")}
                  </Heading>
                  <Controller
                    name="permitTypeId"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <PermitTypeRadioSelect
                          w="full"
                          fetchOptions={() => fetchPermitTypeOptions(true, pidWatch, jurisdictionWatch)}
                          onChange={onChange}
                          value={value}
                        />
                      )
                    }}
                  />
                </Flex>
              )}
              {permitTypeIdWatch && (
                <Flex as="section" direction="column" gap={2}>
                  <Heading as="h2" variant="yellowline">
                    {t("permitApplication.new.workTypeHeading")}
                  </Heading>
                  <ActivityList
                    fetchOptions={() => fetchActivityOptions(true, permitTypeIdWatch)}
                    permitTypeId={permitTypeIdWatch}
                  />
                </Flex>
              )}
              <BackButton isDisabled={isSubmitting} />
            </Flex>
          </FormProvider>
        </form>
      </Container>
    </Flex>
  )
})

export const PinModeInputs = () => {
  const { register, control, setValue } = useFormContext()
  const { jurisdictionStore } = useMst()
  const { addJurisdiction } = jurisdictionStore
  const { t } = useTranslation()

  return (
    <Flex direction="column" bg="greys.grey03" px={6} py={2} gap={4}>
      {t("permitApplication.new.pinRequired")}
      <Flex gap={4}>
        <FormControl>
          <FormLabel>{t("permitApplication.fields.pin")}</FormLabel>
          <Input {...register("pin")} bg="greys.white" />
        </FormControl>

        <Controller
          name="jurisdiction"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <FormControl w="full" zIndex={1}>
                <FormLabel>{t("jurisdiction.index.title")}</FormLabel>
                <InputGroup w="full">
                  <JurisdictionSelect
                    onChange={(value) => {
                      addJurisdiction(value)
                      onChange(value)
                    }}
                    onFetch={() => setValue("jurisdiction", null)}
                    selectedOption={{ label: value?.reverseQualifiedName, value }}
                    menuPortalTarget={document.body}
                  />
                </InputGroup>
              </FormControl>
            )
          }}
        />
      </Flex>
    </Flex>
  )
}

const DisclaimerInfo = () => {
  const { t } = useTranslation()

  const applicationDisclaimers = i18next.t("permitApplication.new.applicationDisclaimers", {
    returnObjects: true,
  }) as Array<{ text: string; href: string }>

  return (
    <Box width="full" mx="auto" mt="10" mb="10" border="1px solid" borderColor="border.light" borderRadius="md" p="6">
      <Text fontWeight="bold">{t("permitApplication.new.applicationDisclaimerInstruction")}</Text>
      <UnorderedList ml="0" mt="4">
        {applicationDisclaimers.map((disclaimer) => {
          return (
            <ListItem key={disclaimer.href}>
              <Link href={disclaimer.href} isExternal>
                {disclaimer.text}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
          )
        })}
      </UnorderedList>
      <Text>{t("permitApplication.new.applicationDisclaimerMoreInfo")}</Text>
      <Link href={t("permitApplication.new.applicationDisclaimerMoreInfo_Link")} isExternal>
        {t("permitApplication.new.applicationDisclaimerMoreInfo_CTA")}
        <ArrowSquareOut></ArrowSquareOut>
      </Link>
    </Box>
  )
}
