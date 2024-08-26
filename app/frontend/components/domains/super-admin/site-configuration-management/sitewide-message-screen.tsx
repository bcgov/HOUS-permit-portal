import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Switch,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { TSiteWideMessageConfiguration } from "../../../../types/types"
import { TextFormControl } from "../../../shared/form/input-form-control"
import { SectionBox } from "../../home/section-box"

export const SitewideMessageScreen = observer(function SitewideMessageScreen() {
  const { siteConfigurationStore } = useMst()
  const { displaySitewideMessage, sitewideMessage, updateSiteConfiguration, configurationLoaded } =
    siteConfigurationStore
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getFormDefaults = () => {
    return { displaySitewideMessage, sitewideMessage }
  }

  const formMethods = useForm<TSiteWideMessageConfiguration>({
    mode: "onChange",
    defaultValues: getFormDefaults(),
  })

  useEffect(() => {
    reset(getFormDefaults())
  }, [configurationLoaded])

  const { handleSubmit, formState, control, reset } = formMethods
  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    await updateSiteConfiguration(formData)
  }

  return (
    <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
      <Heading mb={0} fontSize="3xl">
        {t("siteConfiguration.sitewideMessage.title")}
      </Heading>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex mt={8} gap={16}>
            <Box minW="fit-content">
              <Heading as="h3" noOfLines={1}>
                {t("siteConfiguration.sitewideMessage.settings")}
              </Heading>
            </Box>
            <VStack spacing={8} align="start" w="full">
              <SectionBox>
                <Flex justify="space-between" w="full" gap={16}>
                  <Flex direction="column">
                    <TextFormControl
                      label={t("siteConfiguration.sitewideMessage.label")}
                      fieldName="sitewideMessage"
                      hint={t("siteConfiguration.sitewideMessage.hint")}
                      showOptional={false}
                    />
                  </Flex>
                  <FormControl display="flex" alignItems="center" w="fit-content" gap={2}>
                    <Controller
                      name="displaySitewideMessage"
                      control={control}
                      render={({ field }) => (
                        <Switch id="displaySitewideMessage" isChecked={field.value} onChange={field.onChange} />
                      )}
                    />
                    <FormLabel htmlFor="displaySitewideMessage">
                      {t("siteConfiguration.sitewideMessage.enable")}
                    </FormLabel>
                  </FormControl>
                </Flex>
              </SectionBox>
            </VStack>
          </Flex>
          <Divider my={16} />
          <HStack alignSelf="end">
            <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
              {t("ui.save")}
            </Button>
            <Button variant="secondary" onClick={() => navigate(-1)} isDisabled={isSubmitting}>
              {t("ui.cancel")}
            </Button>
          </HStack>
        </form>
      </FormProvider>
    </Container>
  )
})
