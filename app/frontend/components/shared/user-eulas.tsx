import { Center, HStack, Heading, Stack, Tag, Text } from "@chakra-ui/react"
import { WarningCircle } from "@phosphor-icons/react"
import { format } from "date-fns"
import { observer } from "mobx-react-lite"
import React, { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useCurrentUserLicenseAgreements } from "../../hooks/resources/user-license-agreements"
import { useMst } from "../../setup/root"
import { colors } from "../../styles/theme/foundations/colors"
import { ErrorScreen } from "./base/error-screen"
import { SharedSpinner } from "./base/shared-spinner"
import { RouterLinkButton } from "./navigation/router-link-button"

export const UserEulas = observer(function UserEulas() {
  const { userStore } = useMst()
  const { t } = useTranslation()
  const currentUser = userStore.currentUser
  const currentEulaAccepted = currentUser?.eulaAccepted
  const { error, licenseAgreements, isLoading, currentEula } = useCurrentUserLicenseAgreements()

  const subContent = useMemo(() => {
    if (isLoading) {
      return (
        <Center>
          <SharedSpinner my={3} />
        </Center>
      )
    }

    if (error) {
      return <ErrorScreen error={error} />
    }

    const acceptedLicenseAgreement = licenseAgreements?.find((la) => la.agreement?.id === currentEula?.id)

    return acceptedLicenseAgreement ? (
      <Text color={"text.secondary"} fontSize={"sm"}>
        {t("userEulas.acceptedOn", {
          date: format(acceptedLicenseAgreement.acceptedAt, "MMM dd, yyy"),
          time: format(acceptedLicenseAgreement.acceptedAt, "hh:mm"),
        })}
      </Text>
    ) : (
      <Tag
        as={HStack}
        spacing={1.5}
        w={"fit-content"}
        px={2}
        py={1.5}
        fontSize={"sm"}
        border={"1px solid"}
        borderColor={"semantic.error"}
        bg={"semantic.errorLight"}
      >
        <WarningCircle color={colors.semantic.error} />
        <Text as={"span"}>{t("userEulas.actionRequired")}</Text>
      </Tag>
    )
  }, [isLoading, error, licenseAgreements, currentEula])

  if (!isLoading && !error && !currentEula) {
    return null
  }

  return (
    <HStack
      as={"section"}
      p={6}
      border={"1px solid"}
      borderColor={"border.light"}
      borderRadius={"sm"}
      justifyContent={"space-between"}
    >
      <Stack flex={isLoading || error ? 1 : undefined} gap={currentEulaAccepted ? 1 : 2}>
        <Heading as="h3" m={0}>
          {t("userEulas.title")}
        </Heading>
        {subContent}
      </Stack>
      {isLoading || error ? null : (
        <RouterLinkButton to={"/profile/eula"} variant={currentEulaAccepted ? "secondary" : "primary"}>
          {currentEulaAccepted ? t("userEulas.view") : t("userEulas.viewAgreement")}
        </RouterLinkButton>
      )}
    </HStack>
  )
})
