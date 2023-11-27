import {
  Box,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/center-container"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"
import { RouterLink } from "../../shared/navigation/router-link"
import { SharedSpinner } from "../../shared/ui/shared-spinner"

interface IRegisterScreenProps {}

export const RegisterScreen = ({}: IRegisterScreenProps) => {
  const { t } = useTranslation()
  const {
    userStore: { signUp },
  } = useMst()
  const formMethods = useForm({
    mode: "onSubmit",
    defaultValues: { organization: "", certifiedProfessional: false, username: "", password: "", email: "" },
  })
  const { register, handleSubmit, formState, control } = formMethods

  const [submitted, setSubmitted] = useState(false)

  const onSubmit = (formData) => {
    if (signUp(formData)) {
      setSubmitted(true)
    }
  }

  return (
    <CenterContainer>
      {submitted ? (
        <Box bg="white" p={10}>
          <Text>{t("auth.checkYourEmail")}</Text>
        </Box>
      ) : (
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {formState.isSubmitting ? (
              <SharedSpinner />
            ) : (
              <Flex
                direction="column"
                gap={6}
                w="full"
                p={10}
                border="solid 1px"
                borderColor="gray.300"
                background="white"
              >
                <Flex gap={2} direction="column">
                  <Heading>{t("auth.register")}</Heading>
                  <Text>{t("auth.registerInstructions")}</Text>
                </Flex>
                <Box border="1px solid" borderColor="gray.300" padding={6}>
                  <UsernameFormControl validate autoFocus />
                  <EmailFormControl validate />
                  <FormControl mb={4}>
                    <FormLabel>{t("auth.organizationLabel")}</FormLabel>
                    <Input
                      {...register("organization", {
                        required: false,
                      })}
                    />
                    <FormHelperText>{t("auth.organizationHelpText")}</FormHelperText>
                  </FormControl>
                  <FormControl>
                    <Controller
                      name="certifiedProfessional"
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
                <Box border="1px solid" borderColor="gray.300" padding={6}>
                  <Flex gap={4} direction="column">
                    <Heading>{t("auth.passwordTitle")}</Heading>
                    <Text>{t("auth.passwordRequirements")}</Text>
                    <PasswordFormControl validate />
                  </Flex>
                </Box>
                <HStack gap={4}>
                  <Button type="submit" isLoading={formState.isSubmitting} loadingText={t("ui.loading")}>
                    {t("auth.registerButton")}
                  </Button>
                  <Button variant="outline" isDisabled={formState.isSubmitting}>
                    {t("ui.back")}
                  </Button>
                </HStack>
                <Box bg="gray.200" p={4}>
                  <Flex gap={4} direction="column">
                    <HStack>
                      <Text fontWeight="bold">{t("auth.alreadyHaveAccount")}</Text>{" "}
                      <RouterLink to="/login">{t("auth.login")}</RouterLink>
                    </HStack>
                  </Flex>
                </Box>
              </Flex>
            )}
          </form>
        </FormProvider>
      )}
    </CenterContainer>
  )
}
