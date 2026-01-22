import {
  Box,
  Container,
  Grid,
  Heading,
  Link,
  LinkBox,
  LinkOverlay,
  ListItem,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"
import { CaretRight } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import * as R from "ramda"
import React from "react"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { RouterLink } from "../../shared/navigation/router-link"

export const StandardizationPreviewScreen = observer(function StandardizationPreviewScreen() {
  const { t } = useTranslation()
  const { siteConfigurationStore } = useMst()
  const { standardizationPageEarlyAccessRequirementTemplates } = siteConfigurationStore

  const availableForAdoption = standardizationPageEarlyAccessRequirementTemplates.filter(
    (t) => t.isAvailableForAdoption
  )
  const underDevelopment = standardizationPageEarlyAccessRequirementTemplates.filter((t) => !t.isAvailableForAdoption)

  const renderTemplateGrid = (templates: typeof standardizationPageEarlyAccessRequirementTemplates) => {
    const groupedTemplates = R.groupBy((t) => t.activityCategory, templates)

    return (
      <VStack spacing={8} align="start" w="full">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <VStack key={category} spacing={4} align="start" w="full">
            <Heading as="h3" size="md" mb={2} pb={1}>
              {t(`classification.categories.${category}`, { defaultValue: category })}
            </Heading>
            <Grid templateColumns={{ base: "minmax(0, 400px)", md: "repeat(2, minmax(0, 400px))" }} gap={6} w="full">
              {categoryTemplates?.map((template) => (
                <LinkBox
                  key={template.id}
                  border="1px solid"
                  borderColor="border.light"
                  borderRadius="md"
                  p={6}
                  h="full"
                  position="relative"
                  _hover={{ borderColor: "theme.blue", boxShadow: "sm" }}
                  transition="all 0.2s"
                  cursor="pointer"
                >
                  <VStack align="start" spacing={4} h="full" justify="space-between">
                    <Box>
                      <Heading as="h4" size="sm" mb={3}>
                        {template.nickname}
                      </Heading>
                      <Text fontSize="sm" color="text.secondary">
                        {template.description}
                      </Text>
                    </Box>
                    <LinkOverlay
                      as={RouterLink}
                      to={`/early-access/requirement-templates/${template.id}`}
                      color="text.link"
                      fontWeight="bold"
                      display="flex"
                      alignItems="center"
                      gap={2}
                      _hover={{ textDecoration: "underline" }}
                      alignSelf="flex-end"
                      width="full"
                      justifyContent="flex-end"
                    >
                      {t("standardizationPreview.previewDraftForm")} <CaretRight />
                    </LinkOverlay>
                  </VStack>
                </LinkBox>
              ))}
            </Grid>
          </VStack>
        ))}
      </VStack>
    )
  }

  return (
    <Box bg="greys.white" minH="calc(100vh - 200px)">
      <Container maxW="container.lg" py={16} px={8}>
        <VStack spacing={16} align="start" w="full">
          <VStack spacing={6} align="start" w="full">
            <VStack spacing={2} align="start" w="full">
              <Heading as="h1" size="xl">
                {t("standardizationPreview.title")}
              </Heading>
              <Text fontSize="lg" color="text.secondary">
                {t("standardizationPreview.subtitle")}
              </Text>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.about.title")}
              </Heading>
              <Text>{t("standardizationPreview.about.description1")}</Text>
              <Text>{t("standardizationPreview.about.description2")}</Text>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.resources.title")}
              </Heading>
              <Text>{t("standardizationPreview.resources.description")}</Text>

              <VStack spacing={4} align="start" pl={0} mt={2}>
                <Box>
                  <Text as="span" fontWeight="bold" display="block">
                    {t("standardizationPreview.resources.forms.title")}
                  </Text>
                  <Text>{t("standardizationPreview.resources.forms.description")}</Text>
                </Box>
                <Box>
                  <Text as="span" fontWeight="bold" display="block">
                    {t("standardizationPreview.resources.checklists.title")}
                  </Text>
                  <Text>{t("standardizationPreview.resources.checklists.description")}</Text>
                </Box>
                <Box>
                  <Text as="span" fontWeight="bold" display="block">
                    {t("standardizationPreview.resources.drawing.title")}
                  </Text>
                  <Text>{t("standardizationPreview.resources.drawing.description")}</Text>
                </Box>
                <Box>
                  <Text as="span" fontWeight="bold" display="block">
                    {t("standardizationPreview.resources.terminology.title")}
                  </Text>
                  <Text>{t("standardizationPreview.resources.terminology.description")}</Text>
                </Box>
              </VStack>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.voluntaryUse.title")}
              </Heading>
              <Text>{t("standardizationPreview.voluntaryUse.description1")}</Text>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.benefits.title")}
              </Heading>
              <Text>{t("standardizationPreview.benefits.description")}</Text>

              <VStack spacing={4} align="start" w="full" mt={2}>
                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    {t("standardizationPreview.benefits.applicants.title")}
                  </Heading>
                  <UnorderedList spacing={1} pl={4}>
                    {(t("standardizationPreview.benefits.applicants.list", { returnObjects: true }) as string[]).map(
                      (item, index) => (
                        <ListItem key={item}>{item}</ListItem>
                      )
                    )}
                  </UnorderedList>
                </Box>

                <Box>
                  <Heading as="h3" size="md" mb={2}>
                    {t("standardizationPreview.benefits.localGovernments.title")}
                  </Heading>
                  <UnorderedList spacing={1} pl={4}>
                    {(
                      t("standardizationPreview.benefits.localGovernments.list", { returnObjects: true }) as string[]
                    ).map((item, index) => (
                      <ListItem key={item}>{item}</ListItem>
                    ))}
                  </UnorderedList>
                </Box>
              </VStack>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.feedback.title")}
              </Heading>
              <Text>{t("standardizationPreview.feedback.description")}</Text>
              <Text>
                {t("standardizationPreview.feedback.email")}
                <Link
                  href={`mailto:${t("standardizationPreview.feedback.emailAddress")}`}
                  isExternal
                  textDecoration="underline"
                >
                  {t("standardizationPreview.feedback.emailAddress")}
                </Link>
              </Text>

              <Box mt={4}>
                <Heading as="h3" size="md" mb={2}>
                  {t("standardizationPreview.feedback.demo.title")}
                </Heading>
                <Text>
                  {t("standardizationPreview.feedback.demo.description")}{" "}
                  <Link
                    href="https://e1.envoke.com/ext/pages/6e7bc0aa50913a261f468c45f52734e9"
                    isExternal
                    textDecoration="underline"
                  >
                    {t("standardizationPreview.feedback.demo.link")}
                  </Link>
                </Text>
              </Box>
            </VStack>

            <VStack spacing={4} align="start" w="full">
              <Heading as="h2" variant="yellowline">
                {t("standardizationPreview.explore.title")}
              </Heading>
              <Text>{t("standardizationPreview.explore.description")}</Text>

              <CustomMessageBox
                status={EFlashMessageStatus.info}
                title={t("standardizationPreview.explore.smallScale.title")}
                description={t("standardizationPreview.explore.smallScale.description")}
                width="full"
              />
            </VStack>
          </VStack>

          <VStack spacing={8} align="start" w="full">
            {availableForAdoption.length > 0 && (
              <VStack spacing={4} align="start" w="full">
                <Heading as="h2" variant="yellowline">
                  {t("standardizationPreview.availableForAdoption.title")}
                </Heading>
                {renderTemplateGrid(availableForAdoption)}
              </VStack>
            )}

            {underDevelopment.length > 0 && (
              <VStack spacing={4} align="start" w="full">
                <Heading as="h2" variant="yellowline">
                  {t("standardizationPreview.underDevelopment.title")}
                </Heading>
                {renderTemplateGrid(underDevelopment)}
              </VStack>
            )}
          </VStack>
        </VStack>
      </Container>
    </Box>
  )
})
