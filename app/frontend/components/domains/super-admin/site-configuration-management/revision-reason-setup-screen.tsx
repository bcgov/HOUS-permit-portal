import { Box, Button, Container, Flex, Heading, Input, Text } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React, { useEffect } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { IRevisionReasonsAttributes } from "../../../../types/api-request"
import { SharedSpinner } from "../../../shared/base/shared-spinner"
import { TextFormControl } from "../../../shared/form/input-form-control"

export interface IRevisionReasonForm {
  revisionReasonsAttributes: IRevisionReasonsAttributes[]
}

export const RevisionReasonSetupScreen = observer(function RevisionReasonSetupScreen() {
  const { siteConfigurationStore } = useMst()
  const { updateSiteConfiguration, configurationLoaded, activeRevisionReasons } = siteConfigurationStore
  const { t } = useTranslation()
  const navigate = useNavigate()

  const getFormDefaults = () => {
    return {
      revisionReasonsAttributes: R.isEmpty(activeRevisionReasons)
        ? [{ id: "", reasonCode: "", description: "" }]
        : activeRevisionReasons,
    }
  }

  const formMethods = useForm<IRevisionReasonForm>({
    mode: "onChange",
    defaultValues: getFormDefaults(),
  })

  const { control, handleSubmit, formState, reset, register } = formMethods
  const { isSubmitting } = formState

  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "revisionReasonsAttributes",
    keyName: "fieldId",
  })

  const handleDelete = (index) => {
    if (fields[index].id) {
      update(index, { _discard: true })
    } else {
      remove(index)
    }
  }

  useEffect(() => {
    reset(getFormDefaults())
  }, [configurationLoaded])

  const onSubmit = async (formData: IRevisionReasonForm) => {
    await updateSiteConfiguration(formData)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Container maxW="container.lg" py={8} px={{ base: 8, xl: 0 }} flexGrow={1} as="main">
        <Heading mb={0} fontSize="3xl">
          {t("siteConfiguration.revisionReasonsAttributesSetup.title")}
        </Heading>
        <FormProvider {...formMethods}>
          <Flex mt={8} gap={16}>
            <Box minW="fit-content">
              <Heading as="h3" noOfLines={1}>
                {t("siteConfiguration.revisionReasonsAttributesSetup.options")}
              </Heading>
            </Box>

            <Box as="section" borderRadius="lg" borderWidth={1} borderColor="border.light" p={6} w="full">
              <Flex direction="column" justify="space-between" w="full" gap={8}>
                {R.isNil(activeRevisionReasons) || !configurationLoaded ? (
                  <SharedSpinner />
                ) : (
                  fields.map((field, index) => (
                    <Box borderRadius="md" border="1px solid" borderColor={"border.light"} key={field.fieldId}>
                      <Input type="hidden" {...register(`revisionReasonsAttributes.${index}.id`)} />
                      <Flex p={4} direction="column" gap={6}>
                        <Flex gap={4}>
                          <TextFormControl
                            flex={2}
                            label={t("siteConfiguration.revisionReasonsAttributesSetup.fields.reasonCode")}
                            fieldName={`revisionReasonsAttributes.${index}.reasonCode`}
                            required
                            isDisabled={field._discard}
                          />
                        </Flex>
                        <Flex gap={4}>
                          <TextFormControl
                            flex={2}
                            label={t("siteConfiguration.revisionReasonsAttributesSetup.fields.reasonDescription")}
                            fieldName={`revisionReasonsAttributes.${index}.description`}
                            hint={t("siteConfiguration.revisionReasonsAttributesSetup.fields.descriptionHint")}
                            inputProps={{
                              minH: "40px",
                              height: "40px",
                            }}
                            required
                            isDisabled={field._discard}
                          />
                        </Flex>
                        {!field._discard ? (
                          <Button type="button" variant="secondary" onClick={() => handleDelete(index)}>
                            {t("ui.archive")}
                          </Button>
                        ) : (
                          <Text color="semantic.error">{t("ui.markedForRemoval")}</Text>
                        )}
                      </Flex>
                    </Box>
                  ))
                )}
                {configurationLoaded && (
                  <Button type="button" variant="secondary" onClick={() => append({ reasonCode: "", description: "" })}>
                    {t("ui.add")}
                  </Button>
                )}
              </Flex>
            </Box>
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
