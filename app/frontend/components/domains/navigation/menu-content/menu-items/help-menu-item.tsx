import { Box } from "@chakra-ui/react"
import { Question } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"
import { HelpDrawer } from "../../../../shared/help-drawer"
import { MenuLinkItem } from "../menu-link-item"

export const HelpMenuItem = () => {
  const { t } = useTranslation()

  return (
    <HelpDrawer
      renderTriggerButton={({ onClick }) => (
        <Box w="full" borderRadius="md" _hover={{ bg: "hover.blue", cursor: "pointer" }} asChild>
          <button onClick={onClick}>
            <MenuLinkItem icon={<Question size={20} />} label={t("ui.help")} />
          </button>
        </Box>
      )}
    />
  )
}
