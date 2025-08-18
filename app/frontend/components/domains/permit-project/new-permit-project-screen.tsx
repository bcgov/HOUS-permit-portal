import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react"
import { t } from "i18next"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { useJurisdictionFromSite } from "../../../hooks/use-jurisdiction-from-site"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
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

  useJurisdictionFromSite(watch, setValue, { siteFieldName: "site", jurisdictionIdFieldName: "jurisdictionId" })

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
      <Heading mb={6}>{t("permitProject.new.title")}</Heading>
      <FormProvider {...formMethods}>
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <VStack spacing={8} align="stretch">
            <Flex direction="column" gap={2}>
              <Heading as="h2" variant="yellowline">
                {t("permitProject.new.nameLabel")}
              </Heading>
              <FormControl isInvalid={!!errors.title}>
                <FormLabel htmlFor="title">{t("permitProject.name")}</FormLabel>
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
                {t("permitProject.new.fullAddressLabel")}
              </Heading>
              <Controller
                name="site"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <SitesSelect onChange={onChange} selectedOption={value} pidRequired />
                )}
              />
            </Flex>

            <Button mt={2} variant="primary" isLoading={isSubmitting} isDisabled={!isValid} type="submit">
              {t("permitProject.new.createButton")}
            </Button>
          </VStack>
        </Box>
      </FormProvider>
    </Container>
  )
})
