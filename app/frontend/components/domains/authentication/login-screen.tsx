import { AbsoluteCenter, Box, Button, Divider, Flex, HStack, Heading, Text, VStack } from "@chakra-ui/react"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { BackButton } from "../../shared/buttons/back-button"
import { CenterContainer } from "../../shared/containers/center-container"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"
import { RouterLink } from "../../shared/navigation/router-link"

interface ILoginScreenProps {}

export const LoginScreen = ({}: ILoginScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm({
    mode: "onChange",
  })
  const { handleSubmit, formState, watch } = formMethods
  const {
    sessionStore: { login },
  } = useMst()

  const usernameWatch = watch("username")

  const navigate = useNavigate()

  const { isSubmitting, errors } = formState
  const hasErrors = Object.keys(errors).length > 0

  const onSubmit = async (formData) => {
    if (await login(formData.username, formData.password)) navigate("/")
  }

  return (
    <CenterContainer>
      <Flex direction="column" gap={6} w="full" p={10} border="solid 1px" borderColor="border.light" bg="greys.white">
        <Heading>{t("auth.login")}</Heading>
        <form action="/api/auth/keycloak" method="post">
          {/* @ts-ignore */}
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.bceid_login")}
          </Button>
        </form>
        <Box position="relative" py={2}>
          <Divider borderBottomWidth={2} />
          <AbsoluteCenter bg="white" px="4" textTransform="uppercase" fontSize="sm" fontWeight="medium">
            {t("auth.or")}
          </AbsoluteCenter>
        </Box>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
              <Text>{t("auth.loginInstructions")}</Text>]{" "}
              <Box w="full">
                <UsernameFormControl autoFocus />
                <PasswordFormControl />
              </Box>
              <HStack gap={4} w="full">
                <Button
                  variant="primary"
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText={t("ui.loading")}
                  isDisabled={hasErrors}
                >
                  {t("auth.login")}
                </Button>
                <BackButton isDisabled={isSubmitting} />
              </HStack>
            </VStack>
          </form>
        </FormProvider>

        <Flex gap={2}>
          <RouterLink to="/forgot-password" state={{ username: usernameWatch }}>
            {t("auth.forgotPassword")}
          </RouterLink>
          {" | "}
          <RouterLink to="/register">{t("auth.register")}</RouterLink>
        </Flex>
      </Flex>
    </CenterContainer>
  )
}
