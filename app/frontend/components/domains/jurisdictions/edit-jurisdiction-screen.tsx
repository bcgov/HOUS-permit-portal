import { Box, Button, Container, Flex, FormControl, FormLabel, Heading, Switch, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { useMst } from "../../../setup/root"
import { ErrorScreen } from "../../shared/base/error-screen"
import { AsyncRadioGroup } from "../../shared/base/inputs/async-radio-group"
import { TextFormControl } from "../../shared/form/input-form-control"

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

  const { handleSubmit, formState, control, watch, reset } = formMethods
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
            <Flex direction="column" as="section" gap={6} w="full" p={6} border="solid 1px" borderColor="border.light">
              <Flex gap={8}>
                <Flex w="50%" align="center">
                  <Text mr={4}>The</Text>
                  {useCustom ? (
                    <TextFormControl
                      label={t("jurisdiction.fields.localityType")}
                      fieldName={"localityType"}
                      required
                    />
                  ) : (
                    <AsyncRadioGroup
                      label={t("jurisdiction.fields.localityType")}
                      fetchOptions={fetchLocalityTypeOptions}
                      fieldName={"localityType"}
                    />
                  )}
                  <Text ml={8}>of</Text>
                </Flex>
                <Box w="50%">
                  <TextFormControl label={t("jurisdiction.new.nameLabel")} fieldName={"name"} required />
                </Box>
              </Flex>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="use-custom" mb="0">
                  {t("jurisdiction.new.useCustom")}
                </FormLabel>
                <Switch id="use-custom" isChecked={useCustom} onChange={handleToggleCustom} />
              </FormControl>

              <Flex gap={8}>
                <Box w="full">
                  <TextFormControl
                    label={t("jurisdiction.fields.ltsaMatcher")}
                    fieldName={"ltsaMatcher"}
                    required
                    inputProps={{ isDisabled: true }}
                  />
                </Box>
              </Flex>
            </Flex>
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
