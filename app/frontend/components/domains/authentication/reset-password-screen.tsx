import { Button, Flex, HStack, Heading, Input, Text } from "@chakra-ui/react"
import React from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/center-container"
import { PasswordFormControl } from "../../shared/form/password-form-control"

interface IResetPasswordScreenProps {}

export const ResetPasswordScreen = ({}: IResetPasswordScreenProps) => {
  const { t } = useTranslation()
  const formMethods = useForm()
  const { handleSubmit, formState, register } = formMethods
  const {
    sessionStore: { resetPassword },
  } = useMst()

  const navigate = useNavigate()

  const getResetPasswordToken = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("reset_password_token") || ""
  }

  const onSubmit = async (formData) => {
    resetPassword(formData)
  }

  return (
    <CenterContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormProvider {...formMethods}>
          <Input hidden={true} {...register("resetPasswordToken")} value={getResetPasswordToken()} />
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
              <Heading>{t("auth.resetPassword")}</Heading>
              <Text>{t("auth.passwordRequirements")}</Text>
            </Flex>

            <PasswordFormControl validate />

            <HStack gap={4}>
              <Button type="submit" isLoading={formState.isSubmitting} loadingText={t("ui.loading")}>
                {t("auth.resetPassword")}
              </Button>
              <Button variant="outline" isDisabled={formState.isSubmitting} onClick={() => navigate(-1)}>
                {t("ui.back")}
              </Button>
            </HStack>
          </Flex>
        </FormProvider>
      </form>
    </CenterContainer>
  )
}
