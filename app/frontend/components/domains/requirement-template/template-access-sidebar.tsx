import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react"
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

  // Initialize from model. Assuming enabledJurisdictions is populated.
  // We use local state to track selection before save if needed, or just drive from model if instant save.
  // JurisdictionAccessSelect calls onSave, so we can just rely on that.
  // But we need to pass 'value'.

  // RequirementTemplate.enabledJurisdictions is IOption-like? No, it's {id, qualifiedName}
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
    // Optional: Local update if we wanted optimistic UI in the Select,
    // but AsyncSelect usually handles its own display value if controlled.
    // JurisdictionAccessSelect takes 'value' prop.
    // We might need a local state if we want to update the UI immediately before the API returns.
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{t("requirementTemplate.access.title", "Manage Access")}</DrawerHeader>
        <DrawerBody>
          <Box mt={4}>
            <JurisdictionAccessSelect
              title={t("requirementTemplate.access.jurisdictionAccess", "Jurisdiction Access")}
              description={t(
                "requirementTemplate.access.description",
                "Control which jurisdictions can use this template."
              )}
              value={currentOptions}
              enabledForAll={requirementTemplate.availableGlobally ?? false}
              onChange={handleChange}
              onSave={handleSave}
              onToggleEnabledForAll={handleToggleAvailableGlobally}
              enableForAllLabel={t("requirementTemplate.access.enableForAll", "Available to All Jurisdictions")}
              enableForAllDescription={t(
                "requirementTemplate.access.enableForAllDesc",
                "This template is available to all jurisdictions."
              )}
            />
          </Box>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
})
