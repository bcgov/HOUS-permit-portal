import { Box, Button, Container, Flex, FormControl, FormLabel, HStack, Heading, Input, Show } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { Control, Controller, FormProvider, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useJurisdiction } from "../../../hooks/resources/use-jurisdiction"
import { IJurisdiction } from "../../../models/jurisdiction"
import { useMst } from "../../../setup/root"
import { IContact, TLatLngTuple } from "../../../types/types"
import { BlueTitleBar } from "../../shared/base/blue-title-bar"
import { YellowLineSmall } from "../../shared/base/decorative/yellow-line-small"
import { ErrorScreen } from "../../shared/base/error-screen"
import { LoadingScreen } from "../../shared/base/loading-screen"
import { EditorWithPreview } from "../../shared/editor/custom-extensions/editor-with-preview"
import { Editor } from "../../shared/editor/editor"
import { JurisdictionMap } from "../../shared/module-wrappers/jurisdiction-map"
import { RouterLink } from "../../shared/navigation/router-link"
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

  useEffect(() => {
    reset(getDefaultJurisdictionValues())
  }, [currentJurisdiction?.id])

  if (error) return <ErrorScreen error={error} />
  if (!currentJurisdiction) return <LoadingScreen />

  const { qualifiedName, update } = currentJurisdiction

  const onSubmit = async (formData) => {
    await update(formData)
  }

  return (
    <Flex as="main" direction="column" w="full" bg="greys.white">
      <BlueTitleBar title={qualifiedName} imageSrc={"/images/jurisdiction-bus.svg"} />
      <Show below="md">
        <JurisdictionMap mapPosition={mapPositionWatch} />
      </Show>
      <Container maxW="container.lg" py={{ base: 6, md: 16 }} px={8}>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Flex direction="column" gap={16}>
              <Flex gap={14}>
                <Show above="md">
                  <EditableMap currentJurisdiction={currentJurisdiction} />
                </Show>
                <Flex as="section" flex={1} direction="column" gap={4}>
                  <YellowLineSmall mt={4} />
                  <Heading>{t("jurisdiction.title")}</Heading>
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayDescriptionLabel")}
                    initialTriggerText={t("jurisdiction.edit.addDescription")}
                    name={"descriptionHtml"}
                  />
                  <RouterLinkButton to="#" variant="primary">
                    {t("jurisdiction.startApplication")}
                  </RouterLinkButton>
                </Flex>
              </Flex>
              <Flex direction={{ base: "column", md: "row" }} gap={6}>
                <Flex direction="column" flex={3}>
                  <Flex as="section" direction="column" gap={2}>
                    <YellowLineSmall mt={4} />
                    <Heading>{t("jurisdiction.checklist")}</Heading>
                    <JurisdictionQuillFormController
                      control={control}
                      label={t("jurisdiction.edit.displayChecklistLabel")}
                      initialTriggerText={t("jurisdiction.edit.addChecklist")}
                      name={"checklistHtml"}
                    />
                  </Flex>
                </Flex>
                <Flex
                  as="section"
                  direction="column"
                  p={6}
                  flex={2}
                  gap={4}
                  borderRadius="lg"
                  border="1px solid"
                  borderColor="border.light"
                >
                  <Heading>{t("jurisdiction.lookOut")}</Heading>
                  <JurisdictionQuillFormController
                    control={control}
                    label={t("jurisdiction.edit.displayLookOutLabel")}
                    initialTriggerText={t("jurisdiction.edit.addLookOut")}
                    name={"lookOutHtml"}
                  />
                </Flex>
              </Flex>

              <Flex as="section" direction="column" borderRadius="lg" boxShadow="md">
                <Box py={3} px={6} bg="theme.blueAlt" borderTopRadius="lg">
                  <Heading color="greys.white" fontSize="xl">
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
                  </Can>
                  <ContactGrid isEditing={isEditingContacts} />
                </Flex>
              </Flex>

              <Can action={"jurisdiction:manage"} data={{ jurisdiction: currentJurisdiction }}>
                <Flex w="full" justify="center">
                  <Button
                    variant="primary"
                    type="submit"
                    isDisabled={isSubmitting}
                    isLoading={isSubmitting}
                    loadingText={t("ui.loading")}
                  >
                    {t("ui.save")}
                  </Button>
                </Flex>
              </Can>

              <RouterLink to="#">{t("jurisdiction.didNotFind")}</RouterLink>
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
          >
            {!isEditingMap && t("jurisdiction.edit.clickToEditMap")}
          </Button>
        </Can>
        {isEditingMap && (
          <FormControl flex={1}>
            <FormLabel>{t("jurisdiction.fields.mapPosition")}</FormLabel>
            <Controller
              name="mapPosition"
              control={control}
              render={({ field }) => (
                <HStack mb={2}>
                  <Input
                    type="number"
                    aria-label="jurisdiction latitude"
                    placeholder="Latitude"
                    value={field.value[0]}
                    onChange={(e) => field.onChange([parseFloat(e.target.value), field.value[1]])}
                  />
                  <Input
                    type="number"
                    aria-label="jurisdiction longitude"
                    placeholder="Longitude"
                    value={field.value[1]}
                    onChange={(e) => field.onChange([field.value[0], parseFloat(e.target.value)])}
                  />
                </HStack>
              )}
            />
          </FormControl>
        )}
        <JurisdictionMap
          mapPosition={mapPositionWatch}
          onMapDrag={isEditingMap && ((latLng) => setValue("mapPosition", latLng))}
        />
      </Flex>
    </Flex>
  )
}
