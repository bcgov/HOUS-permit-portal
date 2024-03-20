import { Box, Container, Flex, Heading, Link, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { ArrowSquareOut } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { BackButton } from "../../shared/buttons/back-button"
import { ActivityList } from "../../shared/permit-classification/activity-list"
import { PermitTypeRadioSelect } from "../../shared/permit-classification/permit-type-radio-select"
import { SitesSelect } from "../../shared/select/selectors/sites-select"

export type TSearchAddressFormData = {
  addressString: string
}

interface INewPermitApplicationScreenProps {}

export type TCreatePermitApplicationFormData = {
  pid: string
  permitTypeId: string
  activityId: string
  site?: IOption
}

export const NewPermitApplicationScreen = observer(({}: INewPermitApplicationScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm<TCreatePermitApplicationFormData>({
    mode: "onChange",
    defaultValues: {
      pid: "",
      permitTypeId: "",
      activityId: "",
      site: null as IOption,
    },
  })
  const { handleSubmit, formState, control, watch } = formMethods
  const { isSubmitting } = formState
  const { permitClassificationStore, permitApplicationStore, geocoderStore } = useMst()
  const { fetchGeocodedJurisdiction } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions, isLoading } = permitClassificationStore
  const navigate = useNavigate()
  const [siteSelected, setSiteSelected] = useState(false)
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>(null)

  const onSubmit = async (formValues) => {
    const params = { ...formValues, fullAddress: formValues.site.label }
    const permitApplication = await permitApplicationStore.createPermitApplication(params)
    if (permitApplication) {
      navigate(`/permit-applications/${permitApplication.id}/edit`)
    }
  }

  const permitTypeIdWatch = watch("permitTypeId")
  const pidWatch = watch("pid")
  const siteWatch = watch("site")

  useEffect(() => {
    if (!siteWatch?.value) return
    ;(async () => {
      const jurisdiction = await fetchGeocodedJurisdiction(siteWatch?.value)
      setJurisdiction(jurisdiction)
    })()
  }, [siteWatch?.value])

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={t("permitApplication.start")} />
      <Container maxW="container.lg" py={8}>
        <Box
          width="full"
          mx="auto"
          mt="10"
          mb="10"
          border="1px solid"
          borderColor="border.light"
          borderRadius="md"
          p="6"
        >
          <Text fontWeight="bold">{t("permitApplication.new.applicationDisclaimerInstruction")}</Text>
          <UnorderedList ml="0" mt="4">
            <ListItem>
              <Link href={t("permitApplication.new.applicationDisclaimer_1_link")} isExternal>
                {t("permitApplication.new.applicationDisclaimer_1")}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
            <ListItem>
              <Link href={t("permitApplication.new.applicationDisclaimer_2_link")} isExternal>
                {t("permitApplication.new.applicationDisclaimer_2")}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
            <ListItem>
              <Link href={t("permitApplication.new.applicationDisclaimer_3_link")} isExternal>
                {t("permitApplication.new.applicationDisclaimer_3")}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
            <ListItem>
              <Link href={t("permitApplication.new.applicationDisclaimer_4_link")} isExternal>
                {t("permitApplication.new.applicationDisclaimer_4")}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
            <ListItem>
              <Link href={t("permitApplication.new.applicationDisclaimer_5_link")} isExternal>
                {t("permitApplication.new.applicationDisclaimer_5")}
                <ArrowSquareOut></ArrowSquareOut>
              </Link>
            </ListItem>
          </UnorderedList>
          <Text>{t("permitApplication.new.applicationDisclaimerMoreInfo")}</Text>
          <Link href={t("permitApplication.new.applicationDisclaimerMoreInfo_Link")} isExternal>
            {t("permitApplication.new.applicationDisclaimerMoreInfo_CTA")}
            <ArrowSquareOut></ArrowSquareOut>
          </Link>
        </Box>

        {/* Todo - need to check the address, compute the jurisdiction, input permit type and work type After this is
        selected, create is called and you go to the application id in progress with the form */}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...formMethods}>
            <Flex direction="column" gap={12} w="full" bg="greys.white">
              <Flex as="section" direction="column" gap={2}>
                <Heading as="h2" variant="yellowline">
                  {t("permitApplication.new.locationHeading")}
                </Heading>
                <Controller
                  name="site"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <SitesSelect
                        setSiteSelected={setSiteSelected}
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
              </Flex>
              {siteSelected && jurisdiction && (
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
                          fetchOptions={() => fetchPermitTypeOptions(true, pidWatch, jurisdiction.id)}
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
