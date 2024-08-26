import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  InputGroup,
  Switch,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { EJurisdictionTypes } from "../../../types/enums"
import { AsyncRadioGroup } from "../../shared/base/inputs/async-radio-group"
import { TextFormControl } from "../../shared/form/input-form-control"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { JurisdictionSelect } from "../../shared/select/selectors/jurisdiction-select"

export type TCreateJurisdictionFormData = {
  name: string
  localityType: string
  postalAddress: string
  regionalDistrict: IJurisdiction
}

export const NewJurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const [jurisdiction, setJurisdiction] = useState<IJurisdiction>()
  const [useCustom, setUseCustom] = useState<boolean>(false)
  const {
    jurisdictionStore: { createJurisdiction, fetchLocalityTypeOptions, regionalDistrictLocalityType },
  } = useMst()

  const formMethods = useForm<TCreateJurisdictionFormData>({
    mode: "onChange",
    defaultValues: {
      name: "",
      localityType: "",
      postalAddress: "",
      regionalDistrict: null,
    },
  })

  const navigate = useNavigate()
  const { handleSubmit, formState, control, watch } = formMethods
  const localityTypeWatch = watch("localityType")

  const { isSubmitting, isValid } = formState

  const onSubmit = async (formData) => {
    const submissionData = { ...formData, regionalDistrictId: formData.regionalDistrict?.id }
    const createdJurisdiction = (await createJurisdiction(submissionData)) as IJurisdiction
    if (createdJurisdiction) {
      setJurisdiction(createdJurisdiction)
    }
  }

  const handleToggleCustom = () => setUseCustom((pastState) => !pastState)

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
                    <Flex w="50%">
                      <Text mr={4} mt={10}>
                        The
                      </Text>
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

                      <Text ml={8} mt={10}>
                        of
                      </Text>
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
                    <Box w="50%">
                      <TextFormControl
                        label={t("jurisdiction.new.postalAddressLabel")}
                        fieldName={"postalAddress"}
                        required
                      />
                    </Box>

                    <Box w="50%">
                      <Controller
                        name="regionalDistrict"
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          return (
                            <FormControl w="full" zIndex={1}>
                              <FormLabel>{`${t("jurisdiction.fields.regionalDistrictName")} ${t("ui.optional")}`}</FormLabel>
                              <InputGroup w="full">
                                <JurisdictionSelect
                                  onChange={onChange}
                                  isDisabled={localityTypeWatch == regionalDistrictLocalityType}
                                  filters={{ type: EJurisdictionTypes.regionalDistrict }}
                                  selectedOption={{
                                    label: value?.reverseQualifiedName,
                                    value,
                                  }}
                                  menuPortalTarget={document.body}
                                />
                              </InputGroup>
                            </FormControl>
                          )
                        }}
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
