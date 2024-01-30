import { Container, Flex, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { BackButton } from "../../shared/buttons/back-button"
import { ActivityList } from "../../shared/permit-classification/activity-list"
import { PermitTypeRadioSelect } from "../../shared/permit-classification/permit-type-radio-select"
import { SitesSelect } from "../../shared/select/selectors/sites-select"

export type TSearchAddressFormData = {
  addressString: string
}

interface INewPermitApplicationScreenProps {}

export const NewPermitApplicationScreen = observer(({}: INewPermitApplicationScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      pid: "",
      permitType: "",
      site: null as IOption,
    },
  })
  const { handleSubmit, formState, control } = formMethods
  const { isSubmitting } = formState
  const { geocoderStore, permitClassificationStore } = useMst()
  const { fetchSiteOptions } = geocoderStore
  const { fetchPermitTypeOptions, fetchActivityOptions, isLoading } = permitClassificationStore

  const onSubmit = (formValues) => {
    console.tron.log(formValues)
  }

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={t("permitApplication.indexTitle")} />
      <Container maxW="container.lg" py={8}>
        {/* Todo - need to check the address, compute the jurisdiction, input permit type and work type After this is
        selected, create is called and you go to the application id in progress with the form */}

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormProvider {...formMethods}>
            <Flex direction="column" gap={12} w="full" bg="greys.white">
              <Flex as="section" direction="column">
                <YellowLineSmall />
                <Heading fontSize="xl">{t("permitApplication.new.locationHeading")}</Heading>
                <Controller
                  name="site"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <SitesSelect
                        onChange={onChange}
                        fetchOptions={fetchSiteOptions}
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
              <Flex as="section" direction="column">
                <YellowLineSmall />
                <Heading fontSize="xl">{t("permitApplication.new.permitTypeHeading")}</Heading>
                <Controller
                  name="permitType"
                  control={control}
                  render={({ field: { onChange, value } }) => {
                    return (
                      <PermitTypeRadioSelect
                        w="full"
                        fetchOptions={fetchPermitTypeOptions}
                        onChange={onChange}
                        value={value}
                        isLoading={isLoading}
                      />
                    )
                  }}
                />
              </Flex>
              <Flex as="section" direction="column">
                <YellowLineSmall />
                <Heading fontSize="xl">{t("permitApplication.new.workTypeHeading")}</Heading>
                <ActivityList fetchOptions={fetchActivityOptions} isLoading={isLoading} />
              </Flex>
              <BackButton isDisabled={isSubmitting} />
            </Flex>
          </FormProvider>
        </form>
      </Container>
    </Flex>
  )
})
