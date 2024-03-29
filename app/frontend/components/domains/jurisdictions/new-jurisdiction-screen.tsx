import { Box, Button, Center, Container, Flex, HStack, Heading, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { AsyncRadioGroup } from "../../shared/base/inputs/async-radio-group"
import { TextFormControl } from "../../shared/form/input-form-control"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export type TCreateJurisdictionFormData = {
  name: string
  localityType: string
}

export const NewJurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>()
  const {
    jurisdictionStore: { createJurisdiction, fetchLocalityTypeOptions },
  } = useMst()

  const formMethods = useForm<TCreateJurisdictionFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      localityType: "",
    },
  })

  const navigate = useNavigate()
  const { handleSubmit, formState } = formMethods

  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    const createdJurisdiction = (await createJurisdiction(formData)) as IJurisdiction
    if (createdJurisdiction) {
      setJurisdiction(createdJurisdiction)
    }
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
                <Flex
                  direction="column"
                  as="section"
                  gap={6}
                  w="full"
                  p={6}
                  border="solid 1px"
                  borderColor="border.light"
                >
                  <Flex gap={8}>
                    <Center w="50%">
                      <AsyncRadioGroup
                        label={t("jurisdiction.fields.localityType")}
                        fetchOptions={fetchLocalityTypeOptions}
                        fieldName={"localityType"}
                      />
                    </Center>
                    <Box w="50%">
                      <TextFormControl label={t("jurisdiction.new.nameLabel")} fieldName={"name"} required />
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
