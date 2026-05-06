import { Box, Field, Flex, Image, Spacer } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { RouterLinkButton } from "../../shared/navigation/router-link-button"

export const OverheatingCodeNavBar = observer(function OverheatingCodeNavBar() {
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
      <RouterLink to="/">
        <Box w={120} mr={2}>
          <Image
            objectFit="contain"
            htmlHeight="64px"
            htmlWidth="166px"
            alt={t("site.linkHome")}
            src={"/images/logo.svg"}
          />
        </Box>
      </RouterLink>
      <Field.Label fontWeight="bold" fontSize="lg" m={0}>
        {t("overheatingCode.form.title", "Verify compliance with BC overheating requirements")}
      </Field.Label>
      <Spacer />
      <RouterLinkButton to="/overheating-codes" variant="link">
        {t("overheatingCode.form.backToOverheatingCodes", "Go to overheating codes")}
      </RouterLinkButton>
    </Flex>
  )
})
