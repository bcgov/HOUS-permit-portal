import { Button, Container, Flex, Heading } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"

export interface ILandingForm {
  // landingsAttributes: ILandingsAttributes[]
}

export const LandingSetupScreen = observer(function LandingSetupScreen() {
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getFormDefaults = () => {
    return {
      // landingsAttributes: R.isEmpty(activeLandings) ? [{ id: "", reasonCode: "", description: "" }] : activeLandings,
    }
  }

  const formMethods = useForm<ILandingForm>({
    mode: "onChange",
    defaultValues: getFormDefaults(),
  })

  const { control, handleSubmit, formState, reset, register } = formMethods
  const { isSubmitting } = formState

  useEffect(() => {
    reset(getFormDefaults())
  }, [configurationLoaded])

  const onSubmit = async (formData: ILandingForm) => {
    await updateSiteConfiguration(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
        <Heading mb={0} fontSize="3xl">
          {t("siteConfiguration.landingPageSetup.title")}
        </Heading>
        <FormProvider {...formMethods}>
          <Flex mt={8} gap={16}></Flex>
        </FormProvider>
      </Container>
      <Flex
        position="sticky"
        bottom={0}
        bg="greys.white"
        padding={4}
        borderTop="1px solid"
        borderColor="border.light"
        justify="center"
        gap={4}
      >
        <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
          {t("ui.save")}
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
          {t("ui.cancel")}
        </Button>
      </Flex>
    </form>
  )
})
