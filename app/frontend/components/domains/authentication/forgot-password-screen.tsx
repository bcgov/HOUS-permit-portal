import { Button, Flex, HStack, Heading, Text } from "@chakra-ui/react"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { BackButton } from "../../shared/buttons/back-button"
import { CenterContainer } from "../../shared/center-container"
import { UsernameFormControl } from "../../shared/form/username-form-control"

interface IForgotPasswordScreenProps {}

export const ForgotPasswordScreen = ({}: IForgotPasswordScreenProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  const username = location?.state?.username || ""
  const {
    sessionStore: { requestPasswordReset },
  } = useMst()
  const formMethods = useForm({
    mode: "onChange",
    defaultValues: { username },
  })
  const { handleSubmit, formState } = formMethods

  const { isSubmitting } = formState

  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    if (await requestPasswordReset(formData)) navigate("/")
  }

  return (
    <CenterContainer>
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex
            direction="column"
            gap={6}
            w="full"
            p={10}
            border="solid 1px"
            borderColor="border.light"
            background="white"
          >
            <Flex gap={2} direction="column">
              <Heading>{t("auth.forgotPassword")}</Heading>
              <Text>{t("auth.forgotPasswordInstructions")}</Text>
            </Flex>
            <UsernameFormControl />
            <HStack gap={4}>
              <Button variant="primary" type="submit" isLoading={isSubmitting} loadingText={t("ui.loading")}>
                {t("auth.resetPassword")}
              </Button>
              <BackButton isDisabled={isSubmitting} />
            </HStack>
          </Flex>
        </form>
      </FormProvider>
    </CenterContainer>
  )
}
