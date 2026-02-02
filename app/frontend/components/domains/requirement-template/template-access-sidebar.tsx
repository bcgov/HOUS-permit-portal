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
  const disabledJurisdictions = requirementTemplate.explicitlyDisabledJurisdictions ?? []

  // Determine availability status text
  const getAvailabilityStatus = () => {
    if (requirementTemplate.availableGlobally) {
      return {
        title: t("requirementTemplate.access.statusGlobal", "Globally available"),
        description: t(
          "requirementTemplate.access.statusGlobalDesc",
          "All jurisdictions can access and use this template."
        ),
      }
    }
    if (currentOptions.length === 0) {
      return {
        title: t("requirementTemplate.access.statusNone", "Available in 0 jurisdictions"),
        description: t(
          "requirementTemplate.access.statusNoneDesc",
          "No jurisdictions have been granted access to this template."
        ),
      }
    }
    return {
      title: t("requirementTemplate.access.statusSelect", "Available in select jurisdictions"),
      description: t("requirementTemplate.access.statusSelectDesc", {
        count: currentOptions.length,
        defaultValue: "{{count}} jurisdictions have been granted access to this template.",
      }),
    }
  }

  const availabilityStatus = getAvailabilityStatus()

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent pt="var(--app-navbar-height)">
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          <VStack align="start" spacing={1}>
            <Heading as="h2" size="md">
              {t("requirementTemplate.access.title", "Manage access")}
            </Heading>
            <Text fontSize="sm" color="text.secondary" fontWeight="normal">
              {t("requirementTemplate.access.subtitle", "Control which jurisdictions can use this permit template:")}
              <br />
              {requirementTemplate.permitType?.name} / {requirementTemplate.activity?.name}
            </Text>
          </VStack>
        </DrawerHeader>

        <DrawerBody py={6}>
          <VStack spacing={6} align="stretch">
            {/* Availability Section */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color="text.secondary" textTransform="uppercase" letterSpacing="wide">
                {t("requirementTemplate.access.availability", "Availability")}
              </Heading>

              {/* Status Banner - always blue/info */}
              <Box
                p={4}
                mb={4}
                bg="semantic.infoLight"
                borderRadius="md"
                borderLeft="4px solid"
                borderLeftColor="semantic.info"
              >
                <Flex align="center" gap={2} mb={1}>
                  <Globe size={16} weight={requirementTemplate.availableGlobally ? "fill" : "regular"} />
                  <Text fontWeight="semibold">{availabilityStatus.title}</Text>
                </Flex>
                <Text fontSize="sm" color="text.secondary">
                  {availabilityStatus.description}
                </Text>
              </Box>

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
                defaultOpen
                mb={0}
              />
            </Box>

            {/* Jurisdiction Overrides Section - only show if there are disabled jurisdictions */}
            {disabledJurisdictions.length > 0 && (
              <>
                <Divider />
                <Box>
                  <Heading
                    as="h3"
                    size="sm"
                    mb={4}
                    color="text.secondary"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {t("requirementTemplate.access.jurisdictionOverrides", "Jurisdiction overrides")}
                  </Heading>

                  <Box>
                    <Text fontWeight="semibold" fontSize="sm" mb={2}>
                      {t("requirementTemplate.access.disabledBy", "Permit disabled by:")}
                    </Text>
                    <VStack align="start" spacing={1}>
                      {disabledJurisdictions.map((jurisdiction) => (
                        <Text key={jurisdiction.id} fontSize="sm" color="text.secondary">
                          {jurisdiction.qualifiedName}
                        </Text>
                      ))}
                    </VStack>
                  </Box>
                </Box>
              </>
            )}

            <Divider />

            {/* Usage Statistics Section */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color="text.secondary" textTransform="uppercase" letterSpacing="wide">
                {t("requirementTemplate.access.usageStats", "Usage statistics")}
              </Heading>

              <Flex align="center" gap={4} p={4} bg="greys.grey03" borderRadius="md">
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
          </VStack>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
})
