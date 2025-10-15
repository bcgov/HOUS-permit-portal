import { Badge, Box, Flex, Heading, Link, ListItem, Radio, Text, UnorderedList, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { usePreCheck } from "../../../../hooks/resources/use-pre-check"
import { useMst } from "../../../../setup/root"
import { EPreCheckServicePartner } from "../../../../types/enums"
import { FormFooter } from "./form-footer"

interface IServicePartnerFormData {
  servicePartner: string
}

export const ServicePartner = observer(function ServicePartner() {
  const { t } = useTranslation()
  const { currentPreCheck } = usePreCheck()
  const {
    preCheckStore: { updatePreCheck },
  } = useMst()

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = useForm<IServicePartnerFormData>({
    defaultValues: {
      servicePartner: currentPreCheck?.servicePartner || EPreCheckServicePartner.archistar,
    },
  })

  const selectedServicePartner = watch("servicePartner")

  const onSubmit = async (data: IServicePartnerFormData) => {
    if (!currentPreCheck) return
    await updatePreCheck(currentPreCheck.id, {
      servicePartner: data.servicePartner,
    })
  }

  return (
    <Box>
      <Heading as="h2" size="lg" mb={4}>
        {t("preCheck.sections.servicePartner.title", "Service partner")}
      </Heading>
      <Text mb={6}>
        {t(
          "preCheck.sections.servicePartner.intro",
          "To receive a compliance report, your drawings will be analyzed by a third-party service provider. Select the one that best fits your project needs. The Ministry of Housing and Municipal Affairs does not endorse one provider over another."
        )}
      </Text>

      <Heading as="h3" size="md" mb={4}>
        {t("preCheck.sections.servicePartner.availableProviders", "Available providers")}
      </Heading>

      <VStack spacing={4} align="stretch" mb={8}>
        <Controller
          name="servicePartner"
          control={control}
          rules={{ required: "You must select a service provider" }}
          render={({ field }) => (
            <Box
              onClick={() => field.onChange(EPreCheckServicePartner.archistar)}
              borderRadius="lg"
              p={6}
              border="1px solid"
              borderColor={
                selectedServicePartner === EPreCheckServicePartner.archistar ? "theme.blueAlt" : "border.light"
              }
              bg={"white"}
              transition="all 0.2s ease-in-out"
              _hover={{ bg: "semantic.infoLight" }}
              cursor="pointer"
            >
              <Flex direction="column" gap={4}>
                <Flex align="center" gap={2}>
                  <Heading as="h4" fontSize="lg">
                    {t("preCheck.sections.servicePartner.archistarTitle", "Archistar eCheck")}
                  </Heading>
                  <Badge colorScheme="blue" fontSize="xs" textTransform="none">
                    {t("ui.beta", "Beta")}
                  </Badge>
                </Flex>

                <Text>
                  {t(
                    "preCheck.sections.servicePartner.archistarDescription",
                    "Archistar is an Australian technology company that creates tools for property development, generative design, and automated compliance checking."
                  )}{" "}
                  <Link href="https://archistar.ai" isExternal color="text.link" textDecoration="underline">
                    {t("preCheck.sections.servicePartner.visitWebsite", "Visit Archistar's website")}
                  </Link>
                </Text>

                <UnorderedList spacing={2} ml={4}>
                  <ListItem>{t("preCheck.sections.servicePartner.freeToUse", "Free to use")}</ListItem>
                  <ListItem>
                    {t("preCheck.sections.servicePartner.automatedReview", "Automated code analysis and human review")}
                  </ListItem>
                  <ListItem>
                    {t("preCheck.sections.servicePartner.resultsTime", "Results in 48 hours or less")}
                  </ListItem>
                  <ListItem>
                    {t("preCheck.sections.servicePartner.smallResidential", "For small residential buildings only")}
                  </ListItem>
                  <ListItem>
                    {t(
                      "preCheck.sections.servicePartner.preChecksFor",
                      "Pre-checks drawings for the following code requirements:"
                    )}
                    <UnorderedList spacing={1} ml={4} mt={1}>
                      <ListItem>{t("preCheck.sections.servicePartner.buildingHeight", "Building height")}</ListItem>
                      <ListItem>
                        {t("preCheck.sections.servicePartner.footings", "House footings and foundation size")}
                      </ListItem>
                      <ListItem>{t("preCheck.sections.servicePartner.egress", "Shared egress facilities")}</ListItem>
                      <ListItem>{t("preCheck.sections.servicePartner.stairs", "Stairs in dwelling units")}</ListItem>
                    </UnorderedList>
                  </ListItem>
                </UnorderedList>

                <Flex
                  align="center"
                  gap={2}
                  border="1px solid"
                  borderColor={
                    selectedServicePartner === EPreCheckServicePartner.archistar ? "theme.blueAlt" : "border.light"
                  }
                  bg="white"
                  px={4}
                  py={2}
                  borderRadius="md"
                  alignSelf="flex-end"
                >
                  <Radio
                    isChecked={selectedServicePartner === EPreCheckServicePartner.archistar}
                    value={EPreCheckServicePartner.archistar}
                    pointerEvents="none"
                  />
                  <Text fontWeight="medium">
                    {t("preCheck.sections.servicePartner.selectArchistar", "Pre-check with Archistar eCheck")}
                  </Text>
                </Flex>
              </Flex>
            </Box>
          )}
        />
      </VStack>

      <FormFooter<IServicePartnerFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} isLoading={isSubmitting} />
    </Box>
  )
})
