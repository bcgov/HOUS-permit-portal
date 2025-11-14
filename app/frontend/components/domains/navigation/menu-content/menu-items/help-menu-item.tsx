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
        <Box as="button" onClick={onClick} w="full" borderRadius="md" _hover={{ bg: "hover.blue", cursor: "pointer" }}>
          <MenuLinkItem icon={<Question size={20} />} label={t("ui.help")} />
        </Box>
      )}
    />
  )
}
