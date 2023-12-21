import { Button, Flex, Heading, Input, Text } from "@chakra-ui/react"
import React, { useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useQuickSubmit } from "../../../hooks/use-quick-submit"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/base/center-container"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { TextFormControl } from "../../shared/form/text-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"

interface IAcceptInvitationScreenProps {}

export const AcceptInvitationScreen = ({}: IAcceptInvitationScreenProps) => {
  const { t } = useTranslation()

  const getUserDefaults = () => {
    const urlParams = new URLSearchParams(window.location.search)
    const encodedUser = urlParams.get("user")
    const decodedUser = decodeURIComponent(encodedUser)
    return JSON.parse(decodedUser)
  }

  const userDefaults = getUserDefaults()

  const getInvitationToken = () => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get("invitation_token") || ""
  }

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      firstName: userDefaults.first_name,
      lastName: userDefaults.last_name,
      invitationToken: getInvitationToken(),
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
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }} ref={formRef}>
          <Input hidden={true} {...register("invitationToken")} />
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
              <Heading>{t("user.acceptInvitation")}</Heading>
              <Text>{t("user.acceptInstructions")}</Text>
            </Flex>
            <UsernameFormControl validate autoComplete="off" mb={0} />
            <Flex gap={4}>
              <TextFormControl label="First Name" fieldName="firstName" />
              <TextFormControl label="Last Name" fieldName="lastName" />
            </Flex>
            <PasswordFormControl validate mb={0} />
            <Text>{t("auth.passwordRequirements")}</Text>
            <Button variant="primary" isDisabled={!isValid || isSubmitting} type="submit" isLoading={isSubmitting}>
              Submit
            </Button>
          </Flex>
        </form>
      </FormProvider>
    </CenterContainer>
  )
}
