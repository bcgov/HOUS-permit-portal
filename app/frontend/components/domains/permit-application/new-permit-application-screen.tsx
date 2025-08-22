import {
  Box,
  Button,
  Container,
  Flex,
  FormLabel,
  Heading,
  Image,
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
import { Controller, FormProvider, useForm } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdictionFromSite } from "../../../hooks/use-jurisdiction-from-site"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { IOption } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { BackButton } from "../../shared/buttons/back-button"
import { ActivityList } from "../../shared/permit-classification/activity-list"
import { PermitTypeRadioSelect } from "../../shared/permit-classification/permit-type-radio-select"
import { ManualModeInputs } from "../../shared/select/selectors/manual-mode-inputs"
import { SitesSelect } from "../../shared/select/selectors/sites-select"

export type TSearchAddressFormData = {
  addressString: string
}

interface INewPermitApplicationScreenProps {}

export type TCreatePermitApplicationFormData = {
  pid?: string
  pin?: string
  permitTypeId: string
  activityId: string
  jurisdictionId?: string
  site?: IOption
  firstNations: boolean
  sandboxId?: string
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
  const {
    permitClassificationStore,
    permitApplicationStore,
    geocoderStore,
    sandboxStore,
    userStore,
    jurisdictionStore,
  } = useMst()
  const { fetchGeocodedJurisdiction, fetchingPids } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions } = permitClassificationStore
  const { currentSandboxId } = sandboxStore
  const { getJurisdictionById } = jurisdictionStore
  const { currentUser } = userStore
  const navigate = useNavigate()

  const [pinMode, setPinMode] = useState(false)
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>(null)

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
  const siteWatch = watch("site")
  const jurisdictionIdWatch = watch("jurisdictionId")
  useJurisdictionFromSite(watch, setValue, { siteFieldName: "site", jurisdictionIdFieldName: "jurisdictionId" })
  const firstNationsWatch = watch("firstNations")

  useEffect(() => {
    setJurisdiction(getJurisdictionById(jurisdictionIdWatch))
  }, [jurisdictionIdWatch])

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
        {currentUser.isReviewStaff && (
          <CustomMessageBox
            status={EFlashMessageStatus.info}
            description={t("permitApplication.new.submitToOwn")}
            mb={8}
          />
        )}
        <DisclaimerInfo />
        <TimelineInfo />
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
                {pinMode && <ManualModeInputs disabled={fetchingPids} />}
                <Button variant="link" onClick={() => setPinMode((prev) => !prev)}>
                  {pinMode ? t("permitApplication.new.dontHavePin") : t("permitApplication.pdf.jurisdiction")}
                </Button>
              </Flex>
              {jurisdictionIdWatch && (
                <Flex as="section" direction="column" gap={8}>
                  <Heading as="h2" variant="yellowline">
                    {t("permitApplication.new.firstNationsTitle")}
                  </Heading>
                  <FormLabel htmlFor="firstNations">
                    <Trans
                      i18nKey="permitApplication.new.forFirstNations"
                      components={{
                        // The key '1' corresponds to <1></1> in your translation string
                        1: (
                          <Link
                            isExternal
                            href="https://services.aadnc-aandc.gc.ca/ILRS_Public/Home/Home.aspx?ReturnUrl=%2filrs_public%2f"
                          ></Link>
                        ),
                      }}
                    />
                  </FormLabel>
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
                    dependencyArray={[
                      permitTypeIdWatch,
                      firstNationsWatch,
                      pidWatch,
                      jurisdictionIdWatch,
                      currentSandboxId,
                    ]}
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

interface IPinModeInputsProps {
  disabled?: boolean
}

export const PinModeInputs = observer(({ disabled }: IPinModeInputsProps) => {
  return <ManualModeInputs disabled={disabled} />
})

const DisclaimerInfo = () => {
  const { t } = useTranslation()

  const applicationDisclaimers = i18next.t("permitApplication.new.applicationDisclaimers", {
    returnObjects: true,
  }) as Array<{ text: string; href: string }>

  return (
    <Flex align="center" my={3} flexDirection={{ base: "column", md: "row" }} width="full" mx="auto" p={6} gap={6}>
      <Box w={{ base: "100%", md: "50%" }}>
        <Heading as="h2" variant="yellowline">
          {t("permitApplication.new.needToKnow")}
        </Heading>

        <Text>{t("permitApplication.new.disclaimer1")}</Text>
        <br />
        <Text>{t("permitApplication.new.disclaimer2")}</Text>
      </Box>
    </Flex>
  )
}

const TimelineInfo = () => {
  const { t } = useTranslation()

  const applicationDisclaimers = i18next.t("permitApplication.new.applicationDisclaimers", {
    returnObjects: true,
  }) as Array<{ text: string; href: string }>

  return (
    <Flex
      align="center"
      my={3}
      flexDirection={{ base: "column", md: "row" }}
      width="full"
      mx="auto"
      border="1px solid"
      borderColor="border.light"
      borderRadius="md"
      p={6}
      gap={6}
    >
      <Box w={{ base: "100%", md: "50%" }}>
        <Text fontWeight="bold">{t("permitApplication.new.applicationDisclaimerInstruction")}</Text>
        <UnorderedList ml="0" my={4}>
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
        <Text>
          {t("permitApplication.new.applicationDisclaimerMoreInfo")}{" "}
          <Link href={t("permitApplication.new.applicationDisclaimerMoreInfo_Link")} isExternal>
            {t("permitApplication.new.applicationDisclaimerMoreInfo_CTA")}
            <ArrowSquareOut />
          </Link>
        </Text>
      </Box>
      <Image
        src="/images/timeline/timeline-graphic-full.gif"
        alt="thumbnail for timeline"
        w={{ base: "100%", md: "50%" }}
        bg="semantic.infoLight"
        objectFit="contain"
      />
    </Flex>
  )
}
