import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react"
import debounce from "lodash/debounce"
import { observer } from "mobx-react-lite"
import React, { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import AsyncSelect from "react-select/async"
import { useMst } from "../../../setup/root"
import { IOption } from "../../../types/types"
import { SwitchButton } from "../buttons/switch-button"

interface JurisdictionAccessSelectProps {
  title: string
  description?: string
  value: IOption[]
  enabledForAll: boolean
  onChange: (selectedOptions: IOption[]) => void
  onSave: (selectedOptions: IOption[]) => Promise<void>
  onToggleEnabledForAll: (enabled: boolean) => Promise<void>
  isLoading?: boolean
  enableForAllLabel?: string
  enableForAllDescription?: string
  searchPlaceholder?: string
}

export const JurisdictionAccessSelect = observer(function JurisdictionAccessSelect({
  title,
  description,
  value,
  enabledForAll,
  onChange,
  onSave,
  onToggleEnabledForAll,
  isLoading = false,
  enableForAllLabel,
  enableForAllDescription,
  searchPlaceholder,
}: JurisdictionAccessSelectProps) {
  const { t } = useTranslation()
  const { jurisdictionStore } = useMst()
  const [isSaving, setIsSaving] = useState(false)

  // Load jurisdiction options as user types
  const fetchJurisdictionOptions = (inputValue: string, callback: (options: IOption[]) => void) => {
    jurisdictionStore.fetchJurisdictionOptions({ name: inputValue }).then((options) => {
      // Normalize to use string IDs as values instead of full jurisdiction objects
      const normalizedOptions = options.map((option) => ({
        label: option.label,
        value: option.value?.id,
      }))
      callback(normalizedOptions)
    })
  }

  const debouncedLoadOptions = useCallback(debounce(fetchJurisdictionOptions, 500), [])

  const handleToggleAll = async (e) => {
    const checked = e.target.checked
    await onToggleEnabledForAll(checked)
  }

  const handleJurisdictionsChange = async (selected: readonly IOption[]) => {
    const selectedArray = Array.from(selected)

    // Immediately update parent state for responsive UI
    onChange(selectedArray)

    // Save to backend
    setIsSaving(true)
    try {
      await onSave(selectedArray)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Accordion allowToggle defaultIndex={[]} mb={24}>
      <AccordionItem border="1px solid" borderColor="border.light" borderRadius="md">
        <AccordionButton _hover={{ bg: "greys.grey03" }} px={4} py={4}>
          <Box flex="1" textAlign="left">
            <Heading as="h3" fontSize="lg" mb={1}>
              {title}
            </Heading>
            <Text color="text.secondary" fontSize="sm">
              {description ||
                (enabledForAll
                  ? t("siteConfiguration.globalFeatureAccess.codeComplianceSetup.allJurisdictionsEnabled")
                  : t("siteConfiguration.globalFeatureAccess.codeComplianceSetup.jurisdictionsCount", {
                      count: value.length,
                    }))}
            </Text>
          </Box>
          <AccordionIcon />
        </AccordionButton>

        <AccordionPanel pb={4} pt={4} borderTop="1px solid" borderColor="border.light">
          <Flex
            justify="space-between"
            align="center"
            mb={4}
            pb={4}
            borderBottom="1px solid"
            borderColor="border.light"
          >
            <Text fontWeight="bold">
              {enableForAllLabel || t("siteConfiguration.globalFeatureAccess.codeComplianceSetup.enableForAll")}
            </Text>
            <SwitchButton
              isChecked={enabledForAll}
              onChange={handleToggleAll}
              size="lg"
              isDisabled={isLoading || isSaving}
            />
          </Flex>

          {!enabledForAll && (
            <Box>
              <Text mb={2} fontWeight="medium">
                {t("siteConfiguration.globalFeatureAccess.codeComplianceSetup.enrolledJurisdictions")}
              </Text>
              <AsyncSelect
                isMulti
                cacheOptions
                defaultOptions
                value={value}
                loadOptions={debouncedLoadOptions}
                isClearable={false}
                onChange={handleJurisdictionsChange}
                placeholder={
                  searchPlaceholder ||
                  t("siteConfiguration.globalFeatureAccess.codeComplianceSetup.searchJurisdictions")
                }
                isLoading={isSaving || isLoading}
                isDisabled={isSaving || isLoading}
                menuPortalTarget={typeof document !== "undefined" ? document.body : undefined}
                styles={{
                  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
              />
            </Box>
          )}

          {enabledForAll && (
            <Box p={4} bg="semantic.infoLight" borderRadius="md">
              <Text>
                {enableForAllDescription ||
                  t(
                    "siteConfiguration.globalFeatureAccess.codeComplianceSetup.allJurisdictionsEnabledDescription",
                    "All jurisdictions are currently enabled. Turn off the switch above to select specific jurisdictions."
                  )}
              </Text>
            </Box>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  )
})
