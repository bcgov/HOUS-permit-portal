import { Box, Button, Checkbox, Flex, FormControl, HStack, Heading, Icon, Text } from "@chakra-ui/react"
import { Envelope } from "@phosphor-icons/react"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { handleScrollToTop } from "../../../utils/utility-functions"
import { BackButton } from "../../shared/buttons/back-button"
import { CenterContainer } from "../../shared/containers/center-container"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { TextFormControl } from "../../shared/form/input-form-control"
import { NicknameFormControl } from "../../shared/form/nickname-form-control"

interface IRegisterScreenProps {}

export const RegisterScreen = ({}: IRegisterScreenProps) => {
  const { t } = useTranslation()
  const {
    userStore: { updateProfile, currentUser },
  } = useMst()
  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: {
      organization: "",
      certified: false,
      nickname: currentUser.nickname,
      email: currentUser.email,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
    },
  })
  const { handleSubmit, formState, control } = formMethods

  const [submitted, setSubmitted] = useState(false)

  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    if (await updateProfile(formData)) {
      setSubmitted(true)
      handleScrollToTop()
    }
  }

  return (
    <CenterContainer>
      {submitted || currentUser.confirmationSentAt ? (
        <Box bg="greys.white" border="1px solid" borderColor="border.light" p={10} my="20vh" textAlign="center">
          <Icon boxSize="14" color="theme.blueAlt" as={Envelope} />
          <Heading mt="6">{t("auth.completeAccountActiviation")}</Heading>
          <Text>{t("auth.checkYourEmail")}</Text>
        </Box>
      ) : (
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
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
                <Heading as="h1">{t("auth.register")}</Heading>
                <Text>{t("auth.registerInstructions")}</Text>
              </Flex>
              <Box border="1px solid" borderColor="border.light" padding={6}>
                <NicknameFormControl validate autoFocus />
                <EmailFormControl mb={4} validate required />
                <TextFormControl label={t("auth.userFirstNameLabel")} fieldName="firstName" mb={4} required />
                <TextFormControl label={t("auth.userLastNameLabel")} fieldName="lastName" mb={4} required />
                <TextFormControl label={t("auth.organizationLabel")} fieldName="organization" mb={4} />
                <FormControl>
                  <Controller
                    name="certified"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <Checkbox isChecked={value} onChange={onChange}>
                          {t("auth.certifiedProfessional")}
                        </Checkbox>
                      )
                    }}
                  />
                </FormControl>
              </Box>
              <HStack gap={4}>
                <Button variant="primary" type="submit" isLoading={isSubmitting} loadingText={t("ui.loading")}>
                  {t("auth.registerButton")}
                </Button>
                <BackButton isDisabled={isSubmitting} />
              </HStack>
            </Flex>
          </form>
        </FormProvider>
      )}
    </CenterContainer>
  )
}
