import { Button, Container, Flex, Input, Text } from "@chakra-ui/react"
import React, { useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useQuickSubmit } from "../../../hooks/use-quick-submit"
import { useMst } from "../../../setup/root"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"

interface IAcceptInvitationScreenProps {}

export const AcceptInvitationScreen = ({}: IAcceptInvitationScreenProps) => {
  const { t } = useTranslation()

  const formMethods = useForm({ mode: "onChange" })
  const { handleSubmit, register, formState } = formMethods
  const { userStore } = useMst()
  const { isValid, isSubmitting } = formState
  const formRef = useRef(null)

  const onSubmit = async (values) => {
    await userStore.acceptInvitation(values)
  }

  useQuickSubmit({
    formRef,
    isDisabled: !isValid || isSubmitting,
    onSubmit: handleSubmit(onSubmit),
  })

  const getInvitationToken = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("invitation_token") || ""
  }

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Container maxW="container.lg" py={16} px={8}>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }} ref={formRef}>
            <Input hidden={true} {...register("invitationToken")} value={getInvitationToken()} />
            <Flex direction="column" gap={4}>
              <UsernameFormControl validate autoComplete="off" mb={0} />
              <PasswordFormControl validate mb={0} />
              <Text>{t("auth.passwordRequirements")}</Text>
              <Button
                variant="primary"
                isDisabled={!isValid || isSubmitting}
                type="submit"
                isLoading={isSubmitting}
                my={7}
                w="full"
              >
                Submit
              </Button>
            </Flex>
          </form>
        </FormProvider>
      </Container>
    </Flex>
  )
}
