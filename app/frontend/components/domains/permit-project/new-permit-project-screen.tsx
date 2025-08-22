import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useJurisdictionFromSite } from "../../../hooks/use-jurisdiction-from-site"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { BackButton } from "../../shared/buttons/back-button"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { ManualModeInputs } from "../../shared/select/selectors/manual-mode-inputs"
import { SitesSelect } from "../../shared/select/selectors/sites-select"

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

  const { handleSubmit, formState, control, watch, setValue, register } = formMethods
  const { isSubmitting, errors, isValid } = formState
  const navigate = useNavigate()
  const { permitProjectStore } = useMst()

  const [manualMode, setManualMode] = React.useState(false)

  useJurisdictionFromSite(watch, setValue, {
    siteFieldName: "site",
    jurisdictionIdFieldName: "jurisdictionId",
    disabled: manualMode,
  })

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
      <Flex direction="column" gap={2}>
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
              <FormControl isInvalid={!!errors.title}>
                <FormLabel htmlFor="title" mt={4}>
                  {t("permitProject.new.nameLabel")}
                </FormLabel>
                <Input
                  id="title"
                  {...register("title", {
                    required: t("ui.isRequired", { field: t("permitProject.name") }) as string,
                  })}
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>
            </Flex>

            <Flex direction="column" gap={2}>
              <Heading as="h2" variant="yellowline">
                {t("permitProject.new.fullAddressHeading")}
              </Heading>
              <Controller
                name="site"
                control={control}
                render={({ field: { onChange, value } }) => <SitesSelect onChange={onChange} selectedOption={value} />}
              />
              {manualMode && <ManualModeInputs />}
              <Button variant="link" onClick={() => setManualMode((prev) => !prev)}>
                {t("permitProject.new.jurisdiction")}
              </Button>
            </Flex>

            <HStack>
              <BackButton>{t("ui.back")}</BackButton>
              <Button variant="primary" isLoading={isSubmitting} isDisabled={!isValid} type="submit">
                {t("permitProject.new.createButton")}
              </Button>
            </HStack>
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  )
})
