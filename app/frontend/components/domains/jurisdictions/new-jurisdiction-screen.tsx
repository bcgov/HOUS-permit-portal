import { Box, Button, Container, Flex, HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { JurisdictionFormSection, TJurisdictionFormValues } from "./jurisdiction-form"

export type TCreateJurisdictionFormData = TJurisdictionFormValues

export const NewJurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>()
  const [useCustom, setUseCustom] = useState<boolean>(false)
  const {
    jurisdictionStore: { createJurisdiction },
  } = useMst()

  const formMethods = useForm<TCreateJurisdictionFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      site: null,
      pid: "",
      localityType: "",
      postalAddress: "",
      regionalDistrict: null,
      ltsaMatcher: "",
    },
  })

  const navigate = useNavigate()
  const { handleSubmit, formState, setValue } = formMethods

  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    const submissionData = { ...formData, regionalDistrictId: formData.regionalDistrict?.id }
    const createdJurisdiction = (await createJurisdiction(submissionData)) as IJurisdiction
    if (createdJurisdiction) {
      setJurisdiction(createdJurisdiction)
    }
  }

  const handleToggleCustom = () => setUseCustom((pastState) => !pastState)

  const handleLtsaMatcherFound = (matcher: string | null) => {
    setValue("ltsaMatcher", matcher)
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack alignItems={"flex-start"} spacing={5} w={"full"} h={"full"}>
            <Heading as="h1" alignSelf="center">
              {t("jurisdiction.new.title")}
            </Heading>
            {jurisdiction ? (
              <Flex direction="column" w="full" align="center" gap={6}>
                <Box background="greys.grey03" p={6} w="full">
                  <VStack>
                    <Text>{jurisdiction.qualifier}</Text>
                    <Heading as="h3">{jurisdiction.name}</Heading>
                  </VStack>
                </Box>
                <Text fontWeight="bold" fontSize="lg">
                  {t("jurisdiction.new.nextStep")}
                </Text>
                <HStack>
                  <RouterLinkButton to={`/jurisdictions/${jurisdiction?.slug}/users/invite`} variant="primary">
                    {t("user.index.inviteButton")}
                  </RouterLinkButton>
                  <RouterLinkButton to={`/jurisdictions`} variant="secondary">
                    {t("ui.doLater")}
                  </RouterLinkButton>
                </HStack>
              </Flex>
            ) : (
              <>
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
                    {t("jurisdiction.new.createButton")}
                  </Button>
                  <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                    {t("ui.cancel")}
                  </Button>
                </Flex>
              </>
            )}
          </VStack>
        </form>
      </FormProvider>
    </Container>
  )
})
