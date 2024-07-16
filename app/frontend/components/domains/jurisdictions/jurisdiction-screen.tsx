import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Container,
  Divider,
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
  Show,
  Tag,
  Text,
} from "@chakra-ui/react"

import { ArrowSquareOut } from "@phosphor-icons/react"
import i18next from "i18next"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Control, Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { Trans, useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { EFlashMessageStatus } from "../../../types/enums"
import { IContact, TLatLngTuple } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { CustomMessageBox } from "../../shared/base/custom-message-box"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditorWithPreview } from "../../shared/editor/custom-extensions/editor-with-preview"
import { Editor } from "../../shared/editor/editor"
import { JurisdictionMap } from "../../shared/module-wrappers/jurisdiction-map"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"
import { Can } from "../../shared/user/can"
import { ContactGrid } from "./contacts/contact-grid"
export interface Jurisdiction {
  name: string
  contacts: IContact[]
}

type TJurisdictionFieldValues = {
  descriptionHtml: string
  checklistHtml: string
  lookOutHtml: string
  contactSummaryHtml: string
  mapPosition: TLatLngTuple
  mapZoom: number
  contactsAttributes: IContact[]
}

export const JurisdictionScreen = observer(() => {
  const { t } = useTranslation()
  const { currentJurisdiction, error } = useJurisdiction()

  const getDefaultJurisdictionValues = () => {
    return {
      descriptionHtml: currentJurisdiction?.descriptionHtml,
      checklistHtml: currentJurisdiction?.checklistHtml,
      lookOutHtml: currentJurisdiction?.lookOutHtml,
      contactSummaryHtml: currentJurisdiction?.contactSummaryHtml,
      contactsAttributes: currentJurisdiction?.contacts as IContact[],
      mapPosition: currentJurisdiction?.mapPosition || [0, 0],
      mapZoom: currentJurisdiction?.mapZoom || 13,
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

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const { qualifiedName, update } = currentJurisdiction

  const onSubmit = async (formData) => {
    await update(formData)
    reset(getDefaultJurisdictionValues())
  }

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white" pb="24">
      <BlueTitleBar title={qualifiedName} />
      <Show below="md">
        <JurisdictionMap mapPosition={mapPositionWatch} mapZoom={mapZoomWatch} />
      </Show>
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        {!currentJurisdiction.submissionInboxSetUp && (
          <Box my={8}>
            <CustomMessageBox status={EFlashMessageStatus.warning} description={t("jurisdiction.notEnabled")} />
          </Box>
        )}
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={16}>
              <Flex gap={14}>
                <Show above="md">
                  <EditableMap currentJurisdiction={currentJurisdiction} />
                </Show>
                <Flex as="section" flex={1} direction="column" gap={4}>
                  <Heading>{t("jurisdiction.title")}</Heading>
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayDescriptionLabel")}
                    initialTriggerText={t("jurisdiction.edit.addDescription")}
                    name={"descriptionHtml"}
                  />
                  <RouterLinkButton to="/permit-applications/new" variant="primary">
                    {t("jurisdiction.startApplication")}
                  </RouterLinkButton>
                </Flex>
              </Flex>
              <Flex direction={{ base: "column", md: "row" }} gap={6}>
                <Flex
                  as="section"
                  direction="column"
                  gap={4}
                  flex={3}
                  borderWidth={1}
                  borderColor="border.light"
                  rounded="lg"
                  p={6}
                >
                  <Heading mb={0}>{t("jurisdiction.checklist")}</Heading>
                  <Divider my={0} />
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayChecklistLabel")}
                    initialTriggerText={t("jurisdiction.edit.addChecklist")}
                    name={"checklistHtml"}
                  />
                </Flex>
                <Flex
                  as="section"
                  direction="column"
                  p={6}
                  flex={2}
                  gap={4}
                  borderRadius="lg"
                  background="theme.blueLight"
                >
                  <Heading as="h3">{t("jurisdiction.lookOut")}</Heading>
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayLookOutLabel")}
                    initialTriggerText={t("jurisdiction.edit.addLookOut")}
                    name={"lookOutHtml"}
                  />
                </Flex>
              </Flex>
              <Flex as="section" direction="column" gap={4}>
                <Heading as="h2" fontSize="xl" my={0}>
                  {t("jurisdiction.edit.stepCode.title")}
                </Heading>
                <Box>
                  <Trans
                    i18nKey={"jurisdiction.edit.stepCode.description"}
                    components={{
                      1: <Link href={t("stepCode.helpLink")} isExternal></Link>,
                      2: <ArrowSquareOut />,
                    }}
                  />
                </Box>

                <StepCodeTable currentJurisdiction={currentJurisdiction} />
              </Flex>
              <Flex as="section" direction="column" borderRadius="lg" boxShadow="md">
                <Box py={3} px={6} bg="theme.blueAlt" borderTopRadius="lg">
                  <Heading as="h3" color="greys.white" fontSize="xl">
                    {t("jurisdiction.contactInfo")}
                  </Heading>
                </Box>
                <Flex direction="column" p={6} gap={9}>
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayContactSummaryLabel")}
                    initialTriggerText={t("jurisdiction.edit.addContactSummary")}
                    name={"contactSummaryHtml"}
                  />

                  <Can action="jurisdiction:manage" data={{ jurisdiction: currentJurisdiction }}>
                    <Flex direction="column">
                      <Button
                        variant={"link"}
                        aria-label={"edit contacts"}
                        onClick={() => {
                          setIsEditingContacts((current) => !current)
                        }}
                      >
                        {isEditingContacts
                          ? t("jurisdiction.edit.clickToShowContacts")
                          : t("jurisdiction.edit.clickToEditContacts")}
                      </Button>
                      <Text>{t("jurisdiction.edit.firstContact")}</Text>
                    </Flex>
                  </Can>
                  <ContactGrid isEditing={isEditingContacts} />
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
            </Flex>
          </form>
        </FormProvider>
      </Container>
    </Flex>
  )
})

interface IJurisdictionQuillFormControllerProps {
  control: Control<TJurisdictionFieldValues>
  label: string
  initialTriggerText: string
  name: keyof TJurisdictionFieldValues
}

const JurisdictionQuillFormController = observer(
  ({ control, label, initialTriggerText, name }: IJurisdictionQuillFormControllerProps) => {
    const { jurisdictionStore } = useMst()
    const { currentJurisdiction } = jurisdictionStore
    const { t } = useTranslation()

    return (
      <Box
        sx={{
          ".ql-container.ql-snow": {
            border: "none",
          },
          ".ql-editor": {
            padding: 0,
          },
        }}
      >
        <Can
          action={"jurisdiction:manage"}
          data={{ jurisdiction: currentJurisdiction }}
          onPermissionDeniedRender={
            <Editor value={currentJurisdiction[name]} readOnly={true} modules={{ toolbar: false }} />
          }
        >
          <Controller
            render={({ field: { value, onChange } }) => (
              <EditorWithPreview
                label={label}
                editText={t("ui.clickToEdit")}
                htmlValue={value as string}
                onChange={onChange}
                initialTriggerText={initialTriggerText}
                onRemove={(setEditMode) => {
                  setEditMode(false)
                  onChange("")
                }}
              />
            )}
            name={name}
            control={control}
          />
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
    <Flex flex={1}>
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
          onMapDrag={isEditingMap && ((latLng) => setValue("mapPosition", latLng))}
          onZoomChange={isEditingMap && ((zoom) => setValue("mapZoom", zoom))}
          isEditingMap={isEditingMap}
        />
      </Flex>
    </Flex>
  )
}

interface IStepCodeTableProps {
  currentJurisdiction: IJurisdiction
}

const StepCodeTable: React.FC<IStepCodeTableProps> = ({ currentJurisdiction }) => {
  const { t } = useTranslation()
  const { requiredStepsByPermitType } = currentJurisdiction
  return (
    <Flex direction="column" gap={4}>
      {Object.keys(requiredStepsByPermitType).map(
        (permitTypeId, index) =>
          requiredStepsByPermitType[permitTypeId][0] && (
            <Accordion key={index} allowToggle>
              <AccordionItem borderWidth={1} borderColor="border.light" rounded="sm">
                <AccordionButton bg="greys.grey03" fontWeight="bold">
                  <Box flex="1" textAlign="left">
                    {requiredStepsByPermitType[permitTypeId][0].permitTypeName}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <>
                    <Flex justify="flex-end">
                      <Grid templateColumns="2fr 1fr 2fr" gap={4} w="full" color="text.secondary">
                        <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                          {t("jurisdiction.edit.stepCode.energyStepRequired")}
                        </GridItem>
                        <GridItem textAlign="center"></GridItem>
                        <GridItem textAlign="center" textTransform="uppercase" fontSize="xs">
                          {t("jurisdiction.edit.stepCode.zeroCarbonStepRequired")}
                        </GridItem>
                        {requiredStepsByPermitType[permitTypeId].map((ptrs, i) => (
                          <>
                            <GridItem as={Center}>
                              <Tag bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                                {currentJurisdiction.energyStepRequiredTranslation(ptrs.energyStepRequired)}
                              </Tag>
                            </GridItem>
                            <GridItem as={Center} fontStyle="italic" fontWeight="bold" fontSize="sm" px={4} mx="auto">
                              {t("ui.and")}
                            </GridItem>
                            <GridItem as={Center}>
                              <Tag bg="semantic.successLight" color="inherit" rounded="xs" fontWeight="bold">
                                {currentJurisdiction.zeroCarbonLevelTranslation(ptrs.zeroCarbonStepRequired)}{" "}
                              </Tag>
                            </GridItem>
                            {i !== requiredStepsByPermitType[permitTypeId].length - 1 && (
                              <GridItem
                                colSpan={3}
                                textTransform="uppercase"
                                bg="theme.blueLight"
                                fontStyle="italic"
                                color="text.link"
                                fontSize="sm"
                                px={2}
                                py={1}
                              >
                                {t("ui.or")}
                              </GridItem>
                            )}
                          </>
                        ))}
                      </Grid>
                    </Flex>
                  </>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          )
      )}
    </Flex>
  )
}
