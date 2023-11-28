import { Button, Flex, FormControl, FormLabel, HStack, Heading, Input, Text } from "@chakra-ui/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useLocation, useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/center-container"

interface IForgotPasswordScreenProps {}

export const ForgotPasswordScreen = ({}: IForgotPasswordScreenProps) => {
  const { t } = useTranslation()
  const location = useLocation()
  // const username = location.state.username
  const {
    sessionStore: { requestPasswordReset },
  } = useMst()
  const { register, handleSubmit, formState } = useForm({
    mode: "onChange",
    defaultValues: { email: "" },
  })
  const navigate = useNavigate()

  const onSubmit = (formData) => {
    requestPasswordReset(formData)
  }

  return (
    <CenterContainer>
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
          <FormControl mb={4}>
            <FormLabel>{t("auth.emailLabel")}</FormLabel>
            <Input
              {...register("email", {
                required: true,
              })}
              autoFocus
            />
          </FormControl>
          <HStack gap={4}>
            <Button type="submit" isLoading={formState.isSubmitting} loadingText={t("ui.loading")}>
              {t("auth.resetPassword")}
            </Button>
            <Button variant="outline" isDisabled={formState.isSubmitting} onClick={() => navigate(-1)}>
              {t("ui.back")}
            </Button>
          </HStack>
        </Flex>
      </form>
    </CenterContainer>
  )
}
