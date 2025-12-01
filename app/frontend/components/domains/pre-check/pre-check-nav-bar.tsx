import { Box, Flex, FormLabel, Image, Spacer } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const PreCheckNavBar = observer(function PreCheckNavBar() {
  const { t } = useTranslation()

  return (
    <Flex
      w="full"
      h="var(--app-navbar-height)"
      bg="white"
      borderBottom="1px"
      borderColor="border.light"
      align="center"
      px={6}
      gap={6}
      zIndex={1500}
    >
      <RouterLink to="/welcome">
        <Box w={120} mr={2}>
          <Image fit="contain" htmlHeight="64px" htmlWidth="166px" alt={t("site.linkHome")} src={"/images/logo.svg"} />
        </Box>
      </RouterLink>
      <FormLabel fontWeight="bold" fontSize="lg" m={0}>
        {t("preCheck.form.title", "Pre-check your drawings for compliance with BC Building Code")}
      </FormLabel>
      <Spacer />
      <RouterLinkButton to="/pre-checks" variant="link">
        {t("preCheck.form.backToPreChecks", "Back to pre-checks")}
      </RouterLinkButton>
    </Flex>
  )
})
