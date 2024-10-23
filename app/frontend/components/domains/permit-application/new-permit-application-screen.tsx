import {
  Box,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Image,
  Input,
  InputGroup,
  Link,
  ListItem,
  Radio,
  RadioGroup,
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
  jurisdictionId: string
  site?: IOption
  firstNations: boolean
  sandboxId: string
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
      jurisdictionId: "",
      firstNations: null,
      sandboxId: null,
    },
  })
  const { handleSubmit, formState, control, watch, setValue } = formMethods
  const { isSubmitting } = formState
  const { permitClassificationStore, permitApplicationStore, geocoderStore, jurisdictionStore, sandboxStore } = useMst()
  const { fetchGeocodedJurisdiction, fetchingPids, fetchSiteDetailsFromPid } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions } = permitClassificationStore
  const { getJurisdictionById } = jurisdictionStore
  const { currentSandboxId } = sandboxStore
  const navigate = useNavigate()

  const [pinMode, setPinMode] = useState(false)

  const onSubmit = async (formValues) => {
    const params = {
      ...formValues,
      fullAddress: formValues.site.label,
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
  const jurisdictionIdWatch = watch("jurisdictionId")
  const firstNationsWatch = watch("firstNations")

  useEffect(() => {
    if (R.isNil(siteWatch?.value) && !pidWatch) return

    if (siteWatch?.value == "") {
      setPinMode(true)
      setValue("jurisdictionId", null)
      return
    }

    ;(async () => {
      const jurisdiction = await fetchGeocodedJurisdiction(siteWatch?.value, pidWatch)
      if (jurisdiction && !R.isEmpty(jurisdiction)) {
        setPinMode(false)
        setValue("jurisdictionId", jurisdiction.id)
      } else {
        setPinMode(true)
        setValue("jurisdictionId", null)
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
            <Flex direction="column" gap={8} w="full" bg="greys.white">
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
                {pinMode && <PinModeInputs disabled={fetchingPids} />}
              </Flex>
              {jurisdictionIdWatch && (pidWatch || pinWatch) && (
                <Flex as="section" direction="column" gap={8}>
                  {/* TODO: Enable sandboxes */}
                  {/* {jurisdiction?.sandboxOptions &&  (
                    <Can action="jurisdiction:create">
                      <Flex as="section" direction="column" gap={4}>
                        <Heading as="h2" variant="yellowline">
                          {t("permitApplication.new.sandboxIdHeading")}
                        </Heading>

                        <NewPermitApplicationSandboxSelect options={jurisdiction.sandboxOptions} />
                      </Flex>
                    </Can>
                  )} */}
                  <FormLabel htmlFor="firstNations">{t("permitApplication.new.forFirstNations")}</FormLabel>
                  <Controller
                    name="firstNations"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <RadioGroup
                        onChange={(e) => {
                          return onChange(e === "true")
                        }}
                        value={R.isNil(value) ? null : value ? "true" : "false"}
                      >
                        <Radio value="true">{t("ui.yes")}</Radio>
                        <Radio value="false" ml={4}>
                          {t("ui.no")}
                        </Radio>
                      </RadioGroup>
                    )}
                  />
                  {!R.isNil(firstNationsWatch) && (
                    <>
                      <Heading as="h2" variant="yellowline">
                        {t("permitApplication.new.permitTypeHeading")}
                      </Heading>
                      <Controller
                        name="permitTypeId"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <PermitTypeRadioSelect
                              w={{ base: "full", md: "50%" }}
                              fetchOptions={() => {
                                setValue("permitTypeId", null)
                                setValue("activityId", null)
                                return fetchPermitTypeOptions(true, firstNationsWatch, pidWatch, jurisdictionIdWatch)
                              }}
                              dependencyArray={[firstNationsWatch, pidWatch, jurisdictionIdWatch, currentSandboxId]}
                              onChange={onChange}
                              value={value}
                            />
                          )
                        }}
                      />
                    </>
                  )}
                </Flex>
              )}
              {permitTypeIdWatch && (
                <Flex as="section" direction="column" gap={2}>
                  <Heading as="h2" variant="yellowline">
                    {t("permitApplication.new.workTypeHeading")}
                  </Heading>
                  <ActivityList
                    fetchOptions={() => {
                      setValue("activityId", null)
                      return fetchActivityOptions(true, firstNationsWatch, permitTypeIdWatch)
                    }}
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

export const PinModeInputs = ({ disabled }) => {
  const { register, control, setValue } = useFormContext()
  const { jurisdictionStore, geocoderStore } = useMst()
  const { addJurisdiction } = jurisdictionStore
  const { fetchPinVerification } = geocoderStore
  const { t } = useTranslation()

  const [pinValid, setPinValid] = useState<"unchecked" | "valid" | "invalid">("unchecked")
  //upon inputing pin and losing focus, we should call pin validation
  const handleBlur = async (e) => {
    if (R.isEmpty(e?.target?.value)) {
      setPinValid("unchecked")
    } else {
      try {
        const verified = await fetchPinVerification(e?.target?.value)
        verified ? setPinValid("valid") : setPinValid("invalid")
      } catch (e) {
        setPinValid("invalid")
      }
    }
  }

  return (
    <Flex direction="column" bg="greys.grey03" px={6} py={2} gap={4}>
      {t("permitApplication.new.pinRequired")}
      <Flex gap={4}>
        <FormControl>
          <FormLabel>{t("permitApplication.fields.pin")}</FormLabel>
          <Input {...register("pin")} onBlur={handleBlur} bg="greys.white" disabled={disabled} />
          {pinValid == "valid" && <Text key={"valid"}>{t("permitApplication.new.pinVerified")}</Text>}
          {pinValid == "invalid" && <Text key={"invalid"}>{t("permitApplication.new.pinUnableToVerify")}</Text>}
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
                      if (value) addJurisdiction(value)
                      onChange(value)
                    }}
                    onFetch={() => setValue("jurisdiction", null)}
                    selectedOption={value ? { label: value?.reverseQualifiedName, value } : null}
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
    <Flex
      direction="column"
      width="full"
      mx="auto"
      border="1px solid"
      borderColor="border.light"
      borderRadius="md"
      p="6"
    >
      <Text fontWeight="bold">{t("permitApplication.new.applicationDisclaimerInstruction")}</Text>
      <Flex align="center" my={3} flexDirection={{ base: "column", md: "row" }}>
        <Box w={{ base: "100%", md: "40%" }}>
          <UnorderedList ml="0">
            {applicationDisclaimers.map((disclaimer) => {
              return (
                <ListItem key={disclaimer.href}>
                  <Link href={disclaimer.href} isExternal>
                    {disclaimer.text}
                    <ArrowSquareOut />
                  </Link>
                </ListItem>
              )
            })}
          </UnorderedList>
          <Text>{t("permitApplication.new.applicationDisclaimerMoreInfo")}</Text>
          <Link href={t("permitApplication.new.applicationDisclaimerMoreInfo_Link")} isExternal>
            {t("permitApplication.new.applicationDisclaimerMoreInfo_CTA")}
            <ArrowSquareOut />
          </Link>
        </Box>
        <Image
          src="/images/timeline/timeline-graphic-full.gif"
          alt="thumbnail for timeline"
          w={{ base: "100%", md: "60%" }}
          bg="semantic.infoLight"
          objectFit="contain"
        />
      </Flex>
    </Flex>
  )
}
