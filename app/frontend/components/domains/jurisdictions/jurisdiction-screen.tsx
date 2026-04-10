import {
  Accordion,
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  HStack,
  Heading,
  Input,
  Link,
  ListItem,
  OrderedList,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react"

import { ArrowSquareOut, Pencil } from "@phosphor-icons/react"
import i18next from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Control, Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IContact, TJurisdictionFieldValues } from "../../../types/types"
import { sanitizeTipTapHtml } from "../../../utils/sanitize-tiptap-content"
import { isTipTapEmpty } from "../../../utils/utility-functions"
import { ErrorScreen } from "../../shared/base/error-screen"
import { HeroBanner } from "../../shared/base/hero-banner"
import { HighlightedLayout } from "../../shared/base/highlighted-layout"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { SafeTipTapDisplay } from "../../shared/editor/safe-tiptap-display"
import { JurisdictionResourcesGridSection } from "../../shared/jurisdiction/jurisdiction-resources-grid-section"
import { JurisdictionMap } from "../../shared/module-wrappers/jurisdiction-map"
import { RouterLink } from "../../shared/navigation/router-link"
import { StepCodeRequirementsTable } from "../../shared/step-code-requirements-table"
import { Can, can } from "../../shared/user/can"
import { ContactGrid } from "./contacts/contact-grid"
import { JurisdictionAboutAccordionItem } from "./jurisdiction-about-accordion-item"
import { JurisdictionAboutCtaCards } from "./jurisdiction-about-cta-cards"
import { JurisdictionAboutSnippetCards, jurisdictionAboutSnippetHasContent } from "./jurisdiction-about-snippet-cards"
import { JurisdictionContactInfoBanner } from "./jurisdiction-contact-info-banner"
import { JurisdictionEditorWithPreview } from "./jurisdiction-editor-with-preview"
import { JurisdictionHeroLgWebsiteRow } from "./jurisdiction-hero-lg-website-row"
export interface Jurisdiction {
  name: string
  contacts: IContact[]
}

function jurisdictionRichTextHasPublicContent(html: string | null | undefined): boolean {
  return !isTipTapEmpty(sanitizeTipTapHtml(html ?? ""))
}

export const JurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()
  const { userStore } = useMst()
  const { currentUser } = userStore

  const getDefaultJurisdictionValues = (): TJurisdictionFieldValues => {
    return {
      descriptionHtml: currentJurisdiction?.descriptionHtml ?? "",
      checklistHtml: currentJurisdiction?.checklistHtml ?? "",
      lookOutHtml: currentJurisdiction?.lookOutHtml ?? "",
      contactSummaryHtml: currentJurisdiction?.contactSummaryHtml ?? "",
      contactsAttributes: currentJurisdiction?.contacts as IContact[],
      mapPosition: currentJurisdiction?.mapPosition || [0, 0],
      mapZoom: currentJurisdiction?.mapZoom || 13,
      processingTimeHtml: currentJurisdiction?.processingTimeHtml ?? "",
      keyStagesHtml: currentJurisdiction?.keyStagesHtml ?? "",
      officeAddress: currentJurisdiction?.officeAddress ?? "",
      officeHours: currentJurisdiction?.officeHours ?? "",
      officeTelephone: currentJurisdiction?.officeTelephone ?? "",
      officeEmail: currentJurisdiction?.officeEmail ?? "",
      websiteUrl: currentJurisdiction?.websiteUrl ?? "",
      timelineAndDeliverablesHtml: currentJurisdiction?.timelineAndDeliverablesHtml ?? "",
    }
  }

  const [isEditingContacts, setIsEditingContacts] = useState(false)

  const formMethods = useForm<TJurisdictionFieldValues>({
    mode: "all",
    defaultValues: getDefaultJurisdictionValues(),
  })

  const { handleSubmit, control, reset, watch, formState } = formMethods
  const { isSubmitting, isValid } = formState
  const mapPositionWatch = watch("mapPosition")
  const mapZoomWatch = watch("mapZoom")

  useEffect(() => {
    reset(getDefaultJurisdictionValues())
  }, [currentJurisdiction?.id])

  const canManageAbout = can("jurisdiction:manage", { jurisdiction: currentJurisdiction })
  const showOverviewAccordion =
    canManageAbout || jurisdictionRichTextHasPublicContent(currentJurisdiction?.checklistHtml)
  const showKeyInfoAccordion = canManageAbout || jurisdictionRichTextHasPublicContent(currentJurisdiction?.lookOutHtml)
  const showTimelinesAndDeliverablesAccordion =
    canManageAbout || jurisdictionRichTextHasPublicContent(currentJurisdiction?.timelineAndDeliverablesHtml)

  const hasAboutSnippets = jurisdictionAboutSnippetHasContent(
    currentJurisdiction?.processingTimeHtml,
    currentJurisdiction?.keyStagesHtml,
    currentJurisdiction?.officeAddress
  )

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const { qualifiedName, update, showAboutPage } = currentJurisdiction
  const onSubmit = async (formData) => {
    await update(formData)
    reset(getDefaultJurisdictionValues())
  }

  const contactEmail = t("site.contactEmail")
  const emailBody = t("jurisdiction.notUsingBPH.wantToUse.emailBody", {
    jurisdictionName: qualifiedName,
  })
  const mailtoHref = `mailto:${contactEmail}?subject=${t("jurisdiction.notUsingBPH.wantToUse.emailSubject", {
    jurisdictionName: qualifiedName,
  })}&body=${encodeURIComponent(emailBody)}`

  return (
    <FormProvider {...formMethods}>
      <Flex as="main" direction="column" w="full" bg="greys.white">
        <HeroBanner containerProps={{ pl: 8, pr: { base: 18, md: 8 }, py: 16 }}>
          <HighlightedLayout p={8} gap="18px" maxW={{ md: "calc((200% - var(--chakra-space-6)) / 3)", base: "full" }}>
            <Heading as="h1" mb={0} fontSize="2xl">
              {qualifiedName}
            </Heading>
            <Text fontSize="lg">{t("jurisdiction.heroBannerDescription", { jurisdictionName: qualifiedName })}</Text>
            <JurisdictionHeroLgWebsiteRow canManageAbout={canManageAbout} jurisdictionName={qualifiedName} />
          </HighlightedLayout>
        </HeroBanner>
        {currentUser?.isReviewStaff || showAboutPage ? (
          <>
            <form onSubmit={formMethods.handleSubmit(onSubmit)} className="space-y-8 divide-y divide-gray-200">
              {(hasAboutSnippets || canManageAbout) && (
                <Container maxW="container.lg" p={8}>
                  <JurisdictionAboutSnippetCards control={control} canManage={canManageAbout} />
                </Container>
              )}
              <Box w="full" bg="greys.grey03">
                <Container maxW="container.lg" py={10} px={8}>
                  <Grid w="full" templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={8}>
                    <GridItem order={{ base: 2, md: 1 }} minW={0}>
                      <Flex as="section" direction="column" gap={2}>
                        <Heading id="jurisdiction-supported-description-heading" variant="yellowline" my={0}>
                          {t("jurisdiction.supportedSectionHeading")}
                        </Heading>
                        <JurisdictionTipTapFormController
                          control={control}
                          headingId="jurisdiction-supported-description-heading"
                          name={"descriptionHtml"}
                        />
                      </Flex>
                    </GridItem>
                    <GridItem order={{ base: 1, md: 2 }} minW={0}>
                      <EditableMap currentJurisdiction={currentJurisdiction} />
                    </GridItem>
                    <GridItem colSpan={{ base: 1, md: 2 }} order={{ base: 3, md: 3 }} minW={0}>
                      <JurisdictionAboutCtaCards />
                    </GridItem>
                  </Grid>
                </Container>
              </Box>
              <Container maxW="container.lg" py={16} px={8}>
                <Flex direction="column" gap={12}>
                  <Accordion
                    display="flex"
                    flexDirection="column"
                    gap={4}
                    allowMultiple
                    key={canManageAbout ? "jurisdiction-about-accordion-manage" : "jurisdiction-about-accordion-public"}
                    defaultIndex={canManageAbout ? [0, 1, 2, 3] : [0]}
                  >
                    {showOverviewAccordion && (
                      <JurisdictionAboutAccordionItem
                        headingId="jurisdiction-accordion-overview-heading"
                        title={t("jurisdiction.edit.accordion.overviewProcess")}
                        useYellowlineHeading
                        showTopSeparator={false}
                      >
                        <JurisdictionTipTapFormController
                          control={control}
                          headingId="jurisdiction-accordion-overview-heading"
                          name={"checklistHtml"}
                        />
                      </JurisdictionAboutAccordionItem>
                    )}
                    {showKeyInfoAccordion && (
                      <JurisdictionAboutAccordionItem
                        headingId="jurisdiction-accordion-keyinfo-heading"
                        title={t("jurisdiction.edit.accordion.keyInformation")}
                      >
                        <JurisdictionTipTapFormController
                          control={control}
                          headingId="jurisdiction-accordion-keyinfo-heading"
                          name={"lookOutHtml"}
                        />
                      </JurisdictionAboutAccordionItem>
                    )}
                    {showTimelinesAndDeliverablesAccordion && (
                      <JurisdictionAboutAccordionItem
                        headingId="jurisdiction-accordion-timelines-deliverables-heading"
                        title={t("jurisdiction.edit.accordion.timelinesAndDeliverables")}
                      >
                        <JurisdictionTipTapFormController
                          control={control}
                          headingId="jurisdiction-accordion-timelines-deliverables-heading"
                          name={"timelineAndDeliverablesHtml"}
                        />
                      </JurisdictionAboutAccordionItem>
                    )}
                    <JurisdictionAboutAccordionItem
                      headingId="jurisdiction-accordion-stepcode-heading"
                      title={t("jurisdiction.edit.stepCode.title")}
                    >
                      <Flex as="section" direction="column" gap={4}>
                        <Text fontSize="md" color="text.primary">
                          {t("jurisdiction.edit.stepCode.aboutPageDescription")}
                        </Text>
                        <Text fontSize="md" color="text.primary">
                          {t("jurisdiction.edit.stepCode.aboutPageNotice")}
                        </Text>
                        <Link
                          as={RouterLink}
                          to={`/jurisdictions/${currentJurisdiction.slug}/step-code-requirements`}
                          color="text.link"
                          textDecoration="underline"
                          _hover={{ textDecoration: "none" }}
                          fontWeight="bold"
                        >
                          {t("jurisdiction.edit.stepCode.viewStepCodeRequirements")}{" "}
                          <ArrowSquareOut style={{ display: "inline" }} />
                        </Link>

                        <VStack align="start" spacing={4} mt={4}>
                          <Heading as="h3" fontSize="lg">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.smallSimpleBuildings"
                            )}
                          </Heading>
                          <Text fontSize="md">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.smallSimpleBuildingsDescription"
                            )}
                          </Text>
                          <Text fontSize="md">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.part9BuildingsAreGenerally"
                            )}
                          </Text>
                          <UnorderedList pl={4}>
                            <ListItem>
                              {t(
                                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.smallSimpleBuildingsCharacteristic1"
                              )}
                            </ListItem>
                            <ListItem>
                              {t(
                                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.smallSimpleBuildingsCharacteristic2"
                              )}
                            </ListItem>
                          </UnorderedList>
                          <StepCodeRequirementsTable currentJurisdiction={currentJurisdiction} />
                        </VStack>

                        <VStack align="start" spacing={4} mt={6}>
                          <Heading as="h3" fontSize="lg">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.largeComplexBuildings"
                            )}
                          </Heading>
                          <Text fontSize="md">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.largeComplexBuildingsDescription"
                            )}
                          </Text>
                          <Text fontSize="md">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.part3BuildingsAreGenerally"
                            )}
                          </Text>
                          <UnorderedList pl={4}>
                            <ListItem>
                              {t(
                                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.largeComplexBuildingsCharacteristic1"
                              )}
                            </ListItem>
                            <ListItem>
                              {t(
                                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.largeComplexBuildingsCharacteristic2"
                              )}
                            </ListItem>
                          </UnorderedList>
                          <Text fontSize="md">
                            {t(
                              "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.largeComplexBuildingsLinkPrefix"
                            )}{" "}
                            <Link
                              as={RouterLink}
                              to={`/jurisdictions/${currentJurisdiction.slug}/step-code-requirements`}
                              color="text.link"
                              textDecoration="underline"
                              _hover={{ textDecoration: "none" }}
                            >
                              {t(
                                "home.projectReadinessTools.lookUpStepCodesRequirementsForYourProjectScreen.checkStepCodesRequirementsInThisCommunity"
                              )}
                            </Link>
                            .
                          </Text>
                        </VStack>
                      </Flex>
                    </JurisdictionAboutAccordionItem>
                  </Accordion>
                  <JurisdictionResourcesGridSection
                    jurisdiction={currentJurisdiction}
                    configureResourcesPath={
                      canManageAbout
                        ? `/jurisdictions/${currentJurisdiction.slug}/configuration-management/resources`
                        : undefined
                    }
                  />
                  <JurisdictionAboutCtaCards />
                  <Flex direction="column" gap={4}>
                    <Heading as="h2" variant="yellowline" my={0}>
                      {t("jurisdiction.contactInfo")}
                    </Heading>
                    <JurisdictionTipTapFormController
                      control={control}
                      headingId="jurisdiction-contact-summary-heading"
                      name={"contactSummaryHtml"}
                    />
                    <JurisdictionContactInfoBanner
                      control={control}
                      canManage={canManageAbout}
                      qualifiedName={qualifiedName}
                    />
                    <Can
                      action="jurisdiction:manage"
                      data={{ jurisdiction: currentJurisdiction }}
                      onPermissionDeniedRender={
                        currentJurisdiction.contacts.length > 0 ? <ContactGrid isEditing={false} /> : null
                      }
                    >
                      <Box
                        display="flex"
                        flexDirection="column"
                        border="1px dashed"
                        borderColor="border.light"
                        p={1}
                        gap={1}
                      >
                        <Flex justify="flex-end" w="full">
                          <Button
                            variant="primary"
                            size="xs"
                            leftIcon={<Pencil size={12} />}
                            aria-label={isEditingContacts ? t("ui.done") : t("ui.edit")}
                            onClick={() => {
                              setIsEditingContacts((current) => !current)
                            }}
                          >
                            {isEditingContacts ? t("ui.done") : t("ui.edit")}
                          </Button>
                        </Flex>
                        <ContactGrid isEditing={isEditingContacts} />
                      </Box>
                    </Can>
                  </Flex>
                </Flex>
                <Can action={"jurisdiction:manage"} data={{ jurisdiction: currentJurisdiction }}>
                  <Center w="full" position="fixed" bottom={0} left={0} right={0}>
                    <Button
                      size="lg"
                      mb={4}
                      variant="primary"
                      type="submit"
                      isDisabled={isSubmitting}
                      isLoading={isSubmitting}
                      loadingText={t("ui.loading")}
                    >
                      {t("ui.save")}
                    </Button>
                  </Center>
                </Can>
              </Container>
            </form>
          </>
        ) : (
          <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
            <Box>
              <Heading as="h2" fontSize="2xl" fontWeight="bold" mb={6}>
                {t("jurisdiction.notUsingBPH.title")}
              </Heading>
              <Text fontSize="lg" mb={2}>
                {t("jurisdiction.notUsingBPH.description")}
              </Text>
              <Text fontSize="lg" mb={8}>
                {t("jurisdiction.notUsingBPH.noInfo", { jurisdictionName: qualifiedName })}
              </Text>
              <Box bg="theme.blueLight" borderRadius="lg" p={8} mb={8}>
                <Heading as="h3" fontSize="xl" fontWeight="bold" mb={4}>
                  {t("jurisdiction.notUsingBPH.wantToUse.title")}
                </Heading>
                <Text fontSize="md" mb={2}>
                  {t("jurisdiction.notUsingBPH.wantToUse.description")}
                </Text>
                <Text fontSize="md" mb={6}>
                  {t("jurisdiction.notUsingBPH.wantToUse.emailButtonDescription")}
                </Text>
                <Button
                  as="a"
                  href={mailtoHref}
                  variant="primary"
                  size="lg"
                  rightIcon={<ArrowSquareOut />}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("jurisdiction.notUsingBPH.wantToUse.emailButtonText")}
                </Button>
              </Box>
            </Box>
          </Container>
        )}
      </Flex>
    </FormProvider>
  )
})

interface IJurisdictionTipTapFormControllerProps {
  control: Control<TJurisdictionFieldValues>
  /** Optional; visible section title should use `headingId` + matching `id` on `<Heading>`. */
  label?: string
  name: keyof TJurisdictionFieldValues
  /** `id` of the section `<Heading>` — sets `aria-labelledby` on the editor wrapper for assistive tech. */
  headingId?: string
}

const JurisdictionTipTapFormController = observer(
  ({ control, label, name, headingId }: IJurisdictionTipTapFormControllerProps) => {
    const { jurisdictionStore } = useMst()
    const { currentJurisdiction } = jurisdictionStore
    const { t } = useTranslation()

    return (
      <Box
        sx={{
          ".tiptap-editor-readonly": {
            padding: 0,
          },
        }}
      >
        <Can
          action={"jurisdiction:manage"}
          data={{ jurisdiction: currentJurisdiction }}
          onPermissionDeniedRender={
            // Use SafeTipTapDisplay for safe HTML rendering
            <SafeTipTapDisplay htmlContent={currentJurisdiction[name]} />
          }
        >
          <Box display="flex" flexDirection="column" border="1px dashed" borderColor="border.light" p={1}>
            <Controller
              render={({ field: { value, onChange } }) => (
                <JurisdictionEditorWithPreview
                  label={label}
                  editText={t("ui.clickToEdit")}
                  htmlValue={value as string}
                  onChange={onChange}
                  containerProps={headingId ? { "aria-labelledby": headingId } : undefined}
                  onRemove={(setEditMode) => {
                    setEditMode(false)
                    onChange("")
                  }}
                />
              )}
              name={name}
              control={control}
            />
          </Box>
        </Can>
      </Box>
    )
  }
)

interface IEditableMapProps {
  currentJurisdiction: IJurisdiction
}

const EditableMap = ({ currentJurisdiction }: IEditableMapProps) => {
  const { t } = useTranslation()
  const [isEditingMap, setIsEditingMap] = useState(false)
  const { control, watch, setValue } = useFormContext()
  const mapPositionWatch = watch("mapPosition")
  const mapZoomWatch = watch("mapZoom")

  const editMapSteps = i18next.t("jurisdiction.edit.editMapSteps", { returnObjects: true }) as string[]

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select()
  }

  return (
    <Flex flex={1} w="full">
      <Flex direction="column" w="full">
        <Can action="jurisdiction:manage" data={{ jurisdiction: currentJurisdiction }}>
          <Button
            variant={"link"}
            aria-label={"edit map position"}
            onClick={() => {
              setIsEditingMap((current) => !current)
            }}
            mb={1}
          >
            {!isEditingMap && t("jurisdiction.edit.clickToEditMap")}
            {isEditingMap && t("jurisdiction.edit.clickToSeeMap")}
          </Button>
        </Can>
        {isEditingMap && (
          <>
            <Box p={4} border="1px solid" borderRadius="md" borderColor="border.light" mb={4}>
              <Text fontWeight="bold" mb={4}>
                {t("jurisdiction.edit.editMapStart")}
              </Text>
              <OrderedList>
                {editMapSteps.map((str) => (
                  <ListItem key={str}>{str}</ListItem>
                ))}
              </OrderedList>
              <Text>{t("jurisdiction.edit.editMapEnd")}</Text>
            </Box>
            <FormControl flex={1}>
              <FormLabel>{t("jurisdiction.fields.mapPosition")}</FormLabel>
              <Controller
                name="mapPosition"
                control={control}
                render={({ field }) => (
                  <HStack mb={2}>
                    <Input
                      type="number"
                      onFocus={handleFocus}
                      aria-label="jurisdiction latitude"
                      placeholder="Latitude"
                      value={field.value[0]}
                      onChange={(e) => field.onChange([parseFloat(e.target.value), field.value[1]])}
                    />
                    <Input
                      type="number"
                      onFocus={handleFocus}
                      aria-label="jurisdiction longitude"
                      placeholder="Longitude"
                      value={field.value[1]}
                      onChange={(e) => field.onChange([field.value[0], parseFloat(e.target.value)])}
                    />
                  </HStack>
                )}
              />
            </FormControl>
          </>
        )}
        <JurisdictionMap
          mapPosition={mapPositionWatch}
          mapZoom={mapZoomWatch}
          linePositions={currentJurisdiction.boundaryPoints}
          onMapDrag={isEditingMap && ((latLng) => setValue("mapPosition", latLng))}
          onZoomChange={isEditingMap && ((zoom) => setValue("mapZoom", zoom))}
          isEditingMap={isEditingMap}
        />
      </Flex>
    </Flex>
  )
}
