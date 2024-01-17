import { AbsoluteCenter, Box, Button, Divider, Flex, Heading, Input, Text, VStack } from "@chakra-ui/react"
import React, { useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useSearchParams } from "react-router-dom"
import { useQuickSubmit } from "../../../hooks/use-quick-submit"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/containers/center-container"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { TextFormControl } from "../../shared/form/text-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"

interface IAcceptInvitationScreenProps {}

export const AcceptInvitationScreen = ({}: IAcceptInvitationScreenProps) => {
  const { t } = useTranslation()

  const [searchParams] = useSearchParams()
  const user = JSON.parse(decodeURIComponent(searchParams.get("user")))
  const invitationToken = searchParams.get("invitation_token")
  const jurisdictionName = searchParams.get("jurisdiction_name")

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: user.first_name,
      lastName: user.last_name,
      invitationToken: invitationToken,
    },
  })

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

  return (
    <CenterContainer>
      <Flex direction="column" gap={6} w="full" p={10} border="solid 1px" borderColor="border.light" bg="greys.white">
        <Heading>
          {t("user.acceptInvitation")} {jurisdictionName}
        </Heading>
        <form action={`/api/auth/keycloak`} method="post">
          <Input hidden={true} name="invitation_token" value={invitationToken} />
          <input type="hidden" name="authenticity_token" value={document.querySelector("[name=csrf-token]").content} />
          <Button variant="primary" w="full" type="submit">
            {t("auth.accept_invite_with_bceid")}
          </Button>
        </form>
        <Box position="relative" py={2}>
          <Divider borderBottomWidth={2} />
          <AbsoluteCenter bg="white" px="4" textTransform="uppercase" fontSize="sm" fontWeight="medium">
            {t("auth.or")}
          </AbsoluteCenter>
        </Box>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }} ref={formRef}>
            <VStack spacing={4}>
              <Text>{t("user.acceptInstructions")}</Text>
              <Input hidden={true} {...register("invitationToken")} />
              <UsernameFormControl validate autoComplete="off" mb={0} />
              <Flex gap={4} w="full">
                <TextFormControl label="First Name" fieldName="firstName" />
                <TextFormControl label="Last Name" fieldName="lastName" />
              </Flex>
              <PasswordFormControl validate mb={0} />
              <Text>{t("auth.passwordRequirements")}</Text>
              <Button
                variant="primary"
                w="full"
                isDisabled={!isValid || isSubmitting}
                type="submit"
                isLoading={isSubmitting}
              >
                {t("auth.submit")}
              </Button>
            </VStack>
          </form>
        </FormProvider>
      </Flex>
    </CenterContainer>
  )
}
