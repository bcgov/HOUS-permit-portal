import { Button, Container, Flex, Heading, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { JurisdictionFormSection } from "./jurisdiction-form"

export type TEditJurisdictionFormData = {
  name: string
  localityType: string
  ltsaMatcher: string
}

export const EditJurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const {
    jurisdictionStore: { fetchLocalityTypeOptions },
  } = useMst()

  const navigate = useNavigate()
  const [useCustom, setUseCustom] = useState<boolean>(false)

  // Define the default values based on the current jurisdiction
  const getDefaults = (): TEditJurisdictionFormData => ({
    name: currentJurisdiction?.name || "",
    localityType: currentJurisdiction?.localityType || "",
    ltsaMatcher: currentJurisdiction?.ltsaMatcher || "",
  })

  const formMethods = useForm<TEditJurisdictionFormData>({
    mode: "onChange",
    defaultValues: getDefaults(),
  })

  const { handleSubmit, formState, reset, setValue } = formMethods
  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData: TEditJurisdictionFormData) => {
    const submissionData = {
      ...formData,
    }
    try {
      await currentJurisdiction?.update(submissionData)
      navigate(`/jurisdictions/${currentJurisdiction?.slug}`)
    } catch (submitError) {
      // Handle submission error (optional)
      console.error(submitError)
    }
  }

  const handleToggleCustom = () => setUseCustom((prev) => !prev)

  const handleLtsaMatcherFound = (matcher: string | null) => {
    setValue("ltsaMatcher", matcher)
  }

  useEffect(() => {
    reset(getDefaults())
    // Optionally set useCustom based on currentJurisdiction's localityType
    setUseCustom(currentJurisdiction?.localityType ? false : true)
  }, [currentJurisdiction?.id])

  if (error) return <ErrorScreen error={error} />

  return (
    <Container maxW="container.lg" p={8} as="main">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
            <Heading as="h1" alignSelf="center">
              {t("jurisdiction.edit.title")}
            </Heading>
            <JurisdictionFormSection
              useCustom={useCustom}
              onToggleCustom={handleToggleCustom}
              onLtsaMatcherFound={handleLtsaMatcherFound}
              sitesSelectProps={{ showJurisdiction: false }}
            />
            <Flex gap={4}>
              <Button
                variant="primary"
                type="submit"
                isDisabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
                loadingText={t("ui.loading")}
              >
                {t("jurisdiction.edit.updateButton")}
              </Button>
              <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                {t("ui.cancel")}
              </Button>
            </Flex>
          </VStack>
        </form>
      </FormProvider>
    </Container>
  )
})
