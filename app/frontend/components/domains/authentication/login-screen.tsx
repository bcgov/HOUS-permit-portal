import { Box, Button, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { BackButton } from "../../shared/buttons/back-button"
import { CenterContainer } from "../../shared/center-container"
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
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...formMethods}>
          <Flex
            direction="column"
            gap={6}
            w="full"
            p={10}
            border="solid 1px"
            borderColor="border.light"
            bg="greys.white"
          >
            <Flex gap={2} direction="column">
              <Heading>{t("auth.login")}</Heading>
              <Text>{t("auth.loginInstructions")}</Text>
            </Flex>
            <Box>
              <UsernameFormControl />
              <PasswordFormControl />
            </Box>

            <HStack gap={4}>
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

            <Flex gap={2}>
              <RouterLink to="/forgot-password" state={{ username: usernameWatch }}>
                {t("auth.forgotPassword")}
              </RouterLink>
              {" | "}
              <RouterLink to="/register">{t("auth.register")}</RouterLink>
            </Flex>
          </Flex>
        </FormProvider>
      </form>
    </CenterContainer>
  )
}
