import {
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
import { Buildings, Globe } from "@phosphor-icons/react"
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

              <Flex p={4} bg="greys.grey03" borderRadius="md" align="center" gap={4}>
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
                <Box>
                  <Text fontSize="2xl" fontWeight="bold" lineHeight="1">
                    {usedByCount}
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                    {t("requirementTemplate.access.jurisdictionsUsingTemplate", "jurisdictions using this template")}
                  </Text>
                </Box>
              </Flex>
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
