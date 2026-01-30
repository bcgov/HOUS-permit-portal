import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react"
import { Buildings, Globe, Prohibit } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { IRequirementTemplate } from "../../../models/requirement-template"
import { IOption } from "../../../types/types"
import { JurisdictionAccessSelect } from "../../shared/jurisdiction/jurisdiction-access-select"

interface TemplateAccessSidebarProps {
  requirementTemplate: IRequirementTemplate
  isOpen: boolean
  onClose: () => void
}

export const TemplateAccessSidebar = observer(function TemplateAccessSidebar({
  requirementTemplate,
  isOpen,
  onClose,
}: TemplateAccessSidebarProps) {
  const { t } = useTranslation()

  const currentOptions = (requirementTemplate.enabledJurisdictions || []).map((j) => ({
    label: j.qualifiedName,
    value: j.id,
  }))

  const handleSave = async (options: IOption[]) => {
    const ids = options.map((o) => String(o.value))
    await requirementTemplate.updateJurisdictionAvailabilities(ids)
  }

  const handleToggleAvailableGlobally = async (enabled: boolean) => {
    await requirementTemplate.updateAvailableGlobally(enabled)
  }

  const handleChange = (options: IOption[]) => {
    // Optional: Local update if we wanted optimistic UI in the Select
  }

  const usedByCount = requirementTemplate.usedBy ?? 0
  const disabledJurisdictions = requirementTemplate.explicitlyDisabledJurisdictions ?? []

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent pt="var(--app-navbar-height)">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <VStack align="start" spacing={1}>
            <Text fontSize="sm" color="text.secondary" fontWeight="normal">
              {requirementTemplate.permitType?.name} / {requirementTemplate.activity?.name}
            </Text>
            <Heading as="h2" size="md">
              {t("requirementTemplate.access.title", "Manage access")}
            </Heading>
          </VStack>
        </DrawerHeader>

        <DrawerBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Usage Statistics Section */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color="text.secondary" textTransform="uppercase" letterSpacing="wide">
                {t("requirementTemplate.access.usageStats", "Usage statistics")}
              </Heading>

              <Accordion allowToggle>
                <AccordionItem border="none" bg="greys.grey03" borderRadius="md">
                  <AccordionButton p={4} _hover={{ bg: "greys.grey04" }} borderRadius="md">
                    <Flex align="center" gap={4} flex="1">
                      <Flex
                        align="center"
                        justify="center"
                        w={10}
                        h={10}
                        borderRadius="full"
                        bg="theme.blueLight"
                        color="theme.blue"
                      >
                        <Buildings size={20} weight="fill" />
                      </Flex>
                      <Box textAlign="left">
                        <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                          {usedByCount}
                        </Text>
                        <Text fontSize="sm" color="text.secondary">
                          {t(
                            "requirementTemplate.access.jurisdictionsUsingTemplate",
                            "jurisdictions using this template"
                          )}
                        </Text>
                      </Box>
                    </Flex>
                    {disabledJurisdictions.length > 0 && <AccordionIcon />}
                  </AccordionButton>

                  {disabledJurisdictions.length > 0 && (
                    <AccordionPanel py={4}>
                      <Box
                        p={3}
                        bg="semantic.warningLight"
                        borderRadius="md"
                        borderLeft="3px solid"
                        borderLeftColor="semantic.warning"
                      >
                        <Flex align="center" gap={2} my={2}>
                          <Prohibit size={16} weight="bold" />
                          <Text fontWeight="semibold" fontSize="sm">
                            {t("requirementTemplate.access.explicitlyDisabledBy", "Explicitly disabled by:")}
                          </Text>
                        </Flex>
                        <VStack align="start" spacing={1} pl={6}>
                          {disabledJurisdictions.map((jurisdiction) => (
                            <Text key={jurisdiction.id} fontSize="sm" color="text.secondary">
                              {jurisdiction.qualifiedName}
                            </Text>
                          ))}
                        </VStack>
                      </Box>
                    </AccordionPanel>
                  )}
                </AccordionItem>
              </Accordion>
            </Box>

            <Divider />

            {/* Availability Section */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color="text.secondary" textTransform="uppercase" letterSpacing="wide">
                {t("requirementTemplate.access.availability", "Availability")}
              </Heading>

              <JurisdictionAccessSelect
                title={t("requirementTemplate.access.jurisdictionAccess", "Jurisdiction access")}
                description={t(
                  "requirementTemplate.access.description",
                  "Control which jurisdictions can use this template."
                )}
                value={currentOptions}
                enabledForAll={requirementTemplate.availableGlobally ?? false}
                onChange={handleChange}
                onSave={handleSave}
                onToggleEnabledForAll={handleToggleAvailableGlobally}
                enableForAllLabel={t("requirementTemplate.access.enableForAll", "Available to all jurisdictions")}
                enableForAllDescription={t(
                  "requirementTemplate.access.enableForAllDesc",
                  "This template is available to all jurisdictions."
                )}
                defaultOpen
                mb={4}
              />
            </Box>

            {/* Current Status Summary */}
            <Box
              p={4}
              bg={requirementTemplate.availableGlobally ? "semantic.successLight" : "semantic.infoLight"}
              borderRadius="md"
              borderLeft="4px solid"
              borderLeftColor={requirementTemplate.availableGlobally ? "semantic.success" : "semantic.info"}
            >
              <Flex align="center" gap={2} mb={1}>
                <Globe size={16} weight={requirementTemplate.availableGlobally ? "fill" : "regular"} />
                <Text fontWeight="semibold">
                  {requirementTemplate.availableGlobally
                    ? t("requirementTemplate.access.statusGlobal", "Globally available")
                    : t("requirementTemplate.access.statusRestricted", "Restricted access")}
                </Text>
              </Flex>
              <Text fontSize="sm" color="text.secondary">
                {requirementTemplate.availableGlobally
                  ? t(
                      "requirementTemplate.access.statusGlobalDesc",
                      "All jurisdictions can access and use this template."
                    )
                  : t("requirementTemplate.access.statusRestrictedDesc", {
                      count: currentOptions.length,
                      defaultValue: "{{count}} jurisdictions have been granted access to this template.",
                    })}
              </Text>
            </Box>
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
})
