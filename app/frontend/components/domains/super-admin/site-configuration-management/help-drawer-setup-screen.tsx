import { Box, Button, Container, Flex, FormControl, FormLabel, HStack, Heading, Switch, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { IHelpLinkItems } from "../../../../types/types"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { TextAreaFormControl, TextFormControl } from "../../../shared/form/input-form-control"
import { SectionBox } from "../../home/section-box"

export type THelpDrawerConfiguration = {
  helpLinkItems: IHelpLinkItems
}

export const HelpDrawerSetupScreen = observer(function HelpDrawerSetupScreen() {
  const { siteConfigurationStore } = useMst()
  const { helpLinkItems, updateSiteConfiguration, configurationLoaded } = siteConfigurationStore
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getFormDefaults = () => {
    return { helpLinkItems }
  }

  const formMethods = useForm<THelpDrawerConfiguration>({
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
        <Heading mb={0} fontSize="3xl">
          {t("siteConfiguration.helpDrawerSetup.title")}
        </Heading>
        <FormProvider {...formMethods}>
          <Flex mt={8} gap={16}>
            <Box minW="fit-content">
              <Heading as="h3" noOfLines={1}>
                {t("siteConfiguration.helpDrawerSetup.settings")}
              </Heading>
            </Box>

            <SectionBox>
              <Flex direction="column" justify="space-between" w="full" gap={8}>
                {R.isNil(helpLinkItems) ? (
                  <SharedSpinner />
                ) : (
                  Object.keys(helpLinkItems).map((key) => {
                    return (
                      <Box borderRadius="md" border="1px solid" borderColor="border.light" key={key}>
                        <Flex p={4} direction="column" gap={6}>
                          <Flex gap={4}>
                            <FormControl display="flex" flexDirection="column" flex={1}>
                              <Text fontWeight="bold">
                                {t(`siteConfiguration.helpDrawerSetup.${key as keyof IHelpLinkItems}.label`)}
                              </Text>
                              <HStack mt={3}>
                                <Controller
                                  name={`helpLinkItems.${key as keyof IHelpLinkItems}.show`}
                                  control={control}
                                  render={({ field: { onChange, value } }) => (
                                    <Switch
                                      id="show-switch"
                                      isChecked={!!value}
                                      onChange={(e) => onChange(e.target.checked)}
                                    />
                                  )}
                                />
                                <FormLabel htmlFor="show-switch" mb="0">
                                  {t("siteConfiguration.helpDrawerSetup.fields.show")}
                                </FormLabel>
                              </HStack>
                            </FormControl>
                            <TextFormControl
                              flex={2}
                              label={t("siteConfiguration.helpDrawerSetup.fields.href")}
                              fieldName={`helpLinkItems.${key}.href`}
                              inputProps={{
                                placeholder: t("ui.urlPlaceholder"),
                              }}
                              showOptional={false}
                            />
                          </Flex>
                          <Flex gap={4}>
                            <TextFormControl
                              flex={1}
                              label={t("siteConfiguration.helpDrawerSetup.fields.title")}
                              fieldName={`helpLinkItems.${key}.title`}
                              hint={t("siteConfiguration.helpDrawerSetup.fields.titleHint")}
                              showOptional={false}
                            />
                            <TextAreaFormControl
                              flex={2}
                              label={t("siteConfiguration.helpDrawerSetup.fields.description")}
                              fieldName={`helpLinkItems.${key}.description`}
                              hint={t("siteConfiguration.helpDrawerSetup.fields.descriptionHint")}
                              inputProps={{
                                minH: "40px",
                                height: "40px",
                              }}
                              showOptional={false}
                            />
                          </Flex>
                        </Flex>
                      </Box>
                    )
                  })
                )}
              </Flex>
            </SectionBox>
          </Flex>
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
