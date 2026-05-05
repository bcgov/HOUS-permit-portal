import { Box, Button, Container, Flex, Heading, HStack, Text, VStack } from "@chakra-ui/react"
import { CaretLeft, Info } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { BackButton } from "../../shared/buttons/back-button"
import { TextFormControl } from "../../shared/form/input-form-control"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { SitesSelect } from "../../shared/select/selectors/sites-select"
import { Can } from "../../shared/user/can"
import { NewPermitProjectSandboxSelect } from "./new-permit-project-sandbox-select"

type TCreatePermitProjectFormData = {
  title: string
  pid?: string
  site?: IOption
  jurisdictionId?: string
}

export const NewPermitProjectScreen = observer(() => {
  const formMethods = useForm<TCreatePermitProjectFormData>({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      pid: "",
      site: null as IOption,
      jurisdictionId: "",
    },
  })

  const { handleSubmit, formState, control, register, watch } = formMethods
  const { isSubmitting, errors, isValid } = formState
  const navigate = useNavigate()
  const { permitProjectStore, jurisdictionStore } = useMst()

  const jurisdictionId = watch("jurisdictionId")
  const selectedJurisdiction = jurisdictionId ? jurisdictionStore.getJurisdictionById(jurisdictionId) : null
  const sandboxOptions = selectedJurisdiction?.sandboxOptions ?? []

  useEffect(() => {
    if (jurisdictionId) {
      jurisdictionStore.fetchJurisdiction(jurisdictionId)
    }
  }, [jurisdictionId])

  const onSubmit = async (values: TCreatePermitProjectFormData) => {
    const params = {
      title: values.title,
      fullAddress: values.site?.label,
      pid: values.pid,
      jurisdictionId: values.jurisdictionId,
    }
    const result = await permitProjectStore.createPermitProject(params)
    if (result.ok && result.data) {
      navigate(`/projects/${result.data.id}`)
    }
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Flex direction="column" gap={6}>
        <RouterLinkButton variant="link" to="/projects" leftIcon={<CaretLeft size={24} />}>
          {t("permitProject.back")}
        </RouterLinkButton>
        <Heading mb={6}>{t("permitProject.new.title")}</Heading>
      </Flex>
      <FormProvider {...formMethods}>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={8} align="stretch">
            <Flex direction="column" gap={2} w={{ base: "full", md: "50%" }}>
              <Heading as="h2" variant="yellowline">
                {t("permitProject.new.nameHeading")}
              </Heading>
              <Text>{t("permitProject.new.nameDescription")}</Text>
              <TextFormControl fieldName="title" label={t("permitProject.new.nameLabel")} required />
            </Flex>

            <Flex direction="column" gap={2}>
              <Heading as="h2" variant="yellowline">
                {t("permitProject.new.fullAddressHeading")}
              </Heading>
              <Controller
                name="site"
                control={control}
                rules={{
                  validate: {
                    hasJurisdiction: () => {
                      const jurisdictionId = formMethods.getValues("jurisdictionId")
                      return jurisdictionId
                        ? true
                        : (t("ui.isRequired", { field: t("permitProject.new.fullAddressHeading") }) as string)
                    },
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <SitesSelect
                    onChange={onChange}
                    selectedOption={value}
                    pidName="pid"
                    siteName="site"
                    jurisdictionIdFieldName="jurisdictionId"
                  />
                )}
              />
            </Flex>

            {sandboxOptions.length > 0 && (
              <Can action="jurisdiction:create">
                <Box w={{ base: "full", md: "50%" }}>
                  <Flex
                    gap={4}
                    borderRadius="lg"
                    border="1px solid"
                    borderColor="semantic.special"
                    background="semantic.specialLight"
                    p={6}
                  >
                    <Info />
                    <Flex direction="column">
                      <Heading>{t("sandbox.switch.superAdminAvailable")}</Heading>
                      <Text mb={4}>{t("sandbox.switch.testingPurposes")}</Text>

                      <NewPermitProjectSandboxSelect options={sandboxOptions} />
                    </Flex>
                  </Flex>
                </Box>
              </Can>
            )}

            <HStack>
              <BackButton>{t("ui.back")}</BackButton>
              <Button variant="primary" isLoading={isSubmitting} type="submit">
                {t("permitProject.new.createButton")}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  )
})
