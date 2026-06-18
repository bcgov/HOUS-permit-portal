import { Box, Container, Flex, Heading, Link, Text } from "@chakra-ui/react"
import { CaretLeft } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useJurisdictionTemplateVersionCustomization } from "../../../../../hooks/resources/use-jurisdiction-template-version-customization"
import { useTemplateVersion } from "../../../../../hooks/resources/use-template-version"
import { IJurisdictionTemplateVersionCustomization } from "../../../../../models/jurisdiction-template-version-customization"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus } from "../../../../../types/enums"
import { ITemplateCustomization } from "../../../../../types/types"
import { ErrorScreen } from "../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../shared/base/loading-screen"
import { SwitchButton } from "../../../../shared/buttons/switch-button"
import { RouterLinkButton } from "../../../../shared/navigation/router-link-button"

interface IJurisdictionDigitalPermitSettingsForm {
  customizations: ITemplateCustomization
  disabled: boolean
  requiresProjectMeeting: boolean
}

function formDefaults(
  jurisdictionTemplateVersionCustomization: IJurisdictionTemplateVersionCustomization | undefined
): IJurisdictionDigitalPermitSettingsForm {
  return {
    customizations: {
      requirementBlockChanges: {},
      ...(jurisdictionTemplateVersionCustomization?.customizations ?? {}),
    },
    disabled: jurisdictionTemplateVersionCustomization?.disabled ?? false,
    requiresProjectMeeting: jurisdictionTemplateVersionCustomization?.requiresProjectMeeting ?? false,
  }
}

export const JurisdictionDigitalPermitSettingsScreen = observer(function JurisdictionDigitalPermitSettingsScreen() {
  const { t } = useTranslation()
  const { siteConfigurationStore, uiStore, userStore } = useMst()
  const { currentUser } = userStore
  const jurisdiction = currentUser?.jurisdiction
  const { templateVersion, error: templateVersionError } = useTemplateVersion({
    customErrorMessage: t("errors.fetchBuildingPermit"),
  })
  const { jurisdictionTemplateVersionCustomization, error: customizationError } =
    useJurisdictionTemplateVersionCustomization({
      templateVersion,
      jurisdictionId: jurisdiction?.id,
      customErrorMessage: t("errors.fetchBuildingPermitJurisdictionChanges"),
    })

  const formMethods = useForm<IJurisdictionDigitalPermitSettingsForm>({
    defaultValues: formDefaults(jurisdictionTemplateVersionCustomization),
  })
  const { getValues, reset, setValue, watch } = formMethods
  const [isSaving, setIsSaving] = useState(false)
  const disabled = watch("disabled")
  const requiresProjectMeeting = watch("requiresProjectMeeting")
  const projectMeetingsAvailable =
    siteConfigurationStore.projectMeetingsEnabled && (jurisdiction?.projectMeetingsEnabled ?? false)

  useEffect(() => {
    reset(formDefaults(jurisdictionTemplateVersionCustomization))
  }, [jurisdictionTemplateVersionCustomization, reset])

  if (!jurisdiction) return <ErrorScreen error={new Error(t("errors.fetchJurisdiction"))} />
  if (templateVersionError || customizationError)
    return <ErrorScreen error={templateVersionError || customizationError} />
  if (!templateVersion || !jurisdictionTemplateVersionCustomization) return <LoadingScreen />

  const denormalizedTemplate = templateVersion.denormalizedTemplateJson

  const saveSettings = async (patch: Partial<IJurisdictionDigitalPermitSettingsForm>) => {
    const data = { ...getValues(), ...patch }
    setIsSaving(true)
    try {
      const result = await templateVersion.createOrUpdateJurisdictionTemplateVersionCustomization(jurisdiction.id, data)
      if (!result) {
        reset(formDefaults(jurisdictionTemplateVersionCustomization))
        uiStore.flashMessage.show(EFlashMessageStatus.error, null, t("digitalBuildingPermits.settings.saveError"), 5000)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvailableToApplicantsChange = async (checked: boolean) => {
    const nextDisabled = !checked
    setValue("disabled", nextDisabled)
    await saveSettings({ disabled: nextDisabled })
  }

  const handleRequiresProjectMeetingChange = async (checked: boolean) => {
    setValue("requiresProjectMeeting", checked)
    await saveSettings({ requiresProjectMeeting: checked })
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <Flex direction="column" gap={6}>
        <Box>
          <RouterLinkButton variant="link" to="/digital-building-permits" leftIcon={<CaretLeft size={20} />} mb={6}>
            {t("ui.back")}
          </RouterLinkButton>
          <Heading as="h1" size="2xl" mb={2}>
            {denormalizedTemplate?.nickname || templateVersion.label}
          </Heading>
          <Text>
            {t("digitalBuildingPermits.settings.description")}{" "}
            <Link as={RouterLink} to={`/digital-building-permits/${templateVersion.id}/edit`}>
              {t("digitalBuildingPermits.settings.openForm")}
            </Link>
          </Text>
        </Box>

        <Flex direction="column" gap={0}>
          <SettingsToggleRow
            title={t("digitalBuildingPermits.settings.availableToApplicants.title")}
            description={t("digitalBuildingPermits.settings.availableToApplicants.description")}
            isChecked={!disabled}
            isDisabled={isSaving}
            onChange={handleAvailableToApplicantsChange}
          />
          <SettingsToggleRow
            title={t("digitalBuildingPermits.settings.requiresProjectMeeting.title")}
            description={t("digitalBuildingPermits.settings.requiresProjectMeeting.description")}
            isChecked={requiresProjectMeeting}
            isDisabled={isSaving || !projectMeetingsAvailable}
            disabledDescription={
              !projectMeetingsAvailable
                ? t("digitalBuildingPermits.settings.requiresProjectMeeting.disabledDescription")
                : undefined
            }
            onChange={handleRequiresProjectMeetingChange}
          />
        </Flex>
      </Flex>
    </Container>
  )
})

interface ISettingsToggleRowProps {
  title: string
  description: string
  disabledDescription?: string
  isChecked: boolean
  isDisabled?: boolean
  onChange: (checked: boolean) => void | Promise<void>
}

function SettingsToggleRow({
  title,
  description,
  disabledDescription,
  isChecked,
  isDisabled,
  onChange,
}: ISettingsToggleRowProps) {
  return (
    <Flex align="center" justify="space-between" gap={8} py={5} borderBottom="1px solid" borderColor="border.light">
      <Box>
        <Heading as="h2" fontSize="lg" mb={2}>
          {title}
        </Heading>
        <Text>{description}</Text>
        {disabledDescription && (
          <Text color="text.secondary" fontSize="sm" mt={2}>
            {disabledDescription}
          </Text>
        )}
      </Box>
      <SwitchButton
        isChecked={isChecked}
        isDisabled={isDisabled}
        onChange={(event) => onChange(event.target.checked)}
        size="lg"
      />
    </Flex>
  )
}
