import { Box, Container, Divider, Flex, FormControl, Heading, Link, Text, VStack } from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useSearch } from "../../../hooks/use-search"
import { useMst } from "../../../setup/root"
import { ModelSearchInput } from "../../shared/base/model-search-input"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { StepCodeTypeFilter } from "./step-code-type-filter"
import { StepCodesGrid } from "./step-codes-grid"

export const StepCodeTabPanelContent = observer(() => {
  const { t } = useTranslation()
  const { stepCodeStore } = useMst()

  useSearch(stepCodeStore, [])

  return (
    <Flex direction="column" flex={1} bg="greys.white" pb={24} overflowY="auto" h={"full"}>
      <Container maxW="container.xl" py={8} h={"full"}>
        <VStack spacing={3} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading>{t("stepCode.index.title")}</Heading>
          </Flex>
          <Box w="full" bg="theme.blueLight" p={6} borderRadius="md">
            <Box maxW="xl">
              <Heading as="h3" mb={6}>
                {t("stepCode.index.createReportTitle")}
              </Heading>
              <Text mb={3}>
                {t("stepCode.index.createReportDescriptionPrefix")} {t("stepCode.index.documentsLabel")}
                {/* <Link as={RouterLink} to="/documents" color="text.link" textDecoration="underline">
                  {t("stepCode.index.documentsLabel")}
                </Link> */}
                .
              </Text>
              <RouterLinkButton
                rightIcon={<CaretRight />}
                to="/project-readiness-tools/check-step-code-requirements/select"
              >
                {t("stepCode.createButton")}
              </RouterLinkButton>
              <Divider borderColor="greys.grey03" my={4} />
              <Heading as="h3" mt={2} mb={1}>
                {t("stepCode.index.lookupTitle")}
              </Heading>
              <Text mt={1}>
                {t("stepCode.index.lookupDescriptionPrefix")}{" "}
                <Link
                  as={RouterLink}
                  to="/project-readiness-tools/look-up-step-codes-requirements-for-your-project"
                  color="text.link"
                  textDecoration="underline"
                >
                  {t("stepCode.index.lookupDescriptionLinkLabel")}
                </Link>
                .
              </Text>
            </Box>
          </Box>
          <Flex direction="column" gap={4} w="full">
            <FormControl w="full">
              <ModelSearchInput
                searchModel={stepCodeStore}
                inputProps={{ placeholder: t("ui.search"), width: "full" }}
                inputGroupProps={{ width: "full" }}
              />
            </FormControl>
            <StepCodeTypeFilter searchModel={stepCodeStore} />
          </Flex>

          <StepCodesGrid />
        </VStack>
      </Container>
    </Flex>
  )
})
