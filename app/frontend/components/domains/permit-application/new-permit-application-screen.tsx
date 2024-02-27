import { Container, Flex, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
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
  const { geocoderStore, permitClassificationStore, permitApplicationStore } = useMst()
  const { fetchSiteOptionsForAddress } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions, isLoading } = permitClassificationStore
  const navigate = useNavigate()
  const [siteSelected, setSiteSelected] = useState(false)

  const onSubmit = async (formValues) => {
    const params = { ...formValues, fullAddress: formValues.site.label }
    console.log(params)
    const permitApplication = await permitApplicationStore.createPermitApplication(params)
    if (permitApplication) {
      navigate(`/permit-applications/${permitApplication.id}/edit`)
    }
  }

  const permitTypeIdWatch = watch("permitTypeId")
  const pidWatch = watch("pid")
  const siteWatch = watch("site")

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={t("permitApplication.indexTitle")} />
      <Container maxW="container.lg" py={8}>
        {/* Todo - need to check the address, compute the jurisdiction, input permit type and work type After this is
        selected, create is called and you go to the application id in progress with the form */}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...formMethods}>
            <Flex direction="column" gap={12} w="full" bg="greys.white">
              <Flex as="section" direction="column" gap={2}>
                <Heading fontSize="xl">{t("permitApplication.new.locationHeading")}</Heading>
                <Controller
                  name="site"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <SitesSelect
                        setSiteSelected={setSiteSelected}
                        onChange={onChange}
                        fetchOptions={fetchSiteOptionsForAddress}
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
              {siteSelected && (
                <Flex as="section" direction="column" gap={2}>
                  <Heading fontSize="xl">{t("permitApplication.new.permitTypeHeading")}</Heading>
                  <Controller
                    name="permitTypeId"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <PermitTypeRadioSelect
                          w="full"
                          fetchOptions={() => fetchPermitTypeOptions(true, pidWatch)}
                          onChange={onChange}
                          value={value}
                          isLoading={isLoading}
                        />
                      )
                    }}
                  />
                </Flex>
              )}
              {permitTypeIdWatch && (
                <Flex as="section" direction="column" gap={2}>
                  <Heading fontSize="xl">{t("permitApplication.new.workTypeHeading")}</Heading>
                  <ActivityList
                    fetchOptions={() => fetchActivityOptions(true, permitTypeIdWatch)}
                    permitTypeId={permitTypeIdWatch}
                    isLoading={isLoading}
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
