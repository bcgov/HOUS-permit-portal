import {
  Box,
  Button,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  InputGroup,
  Select,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"
import { EmailFormControl } from "../../shared/form/email-form-control"
import { TextFormControl } from "../../shared/form/input-form-control"
import { PasswordFormControl } from "../../shared/form/password-form-control"
import { UsernameFormControl } from "../../shared/form/username-form-control"

interface IProfileScreenProps {}

export const ProfileScreen = observer(({}: IProfileScreenProps) => {
  const { t } = useTranslation()

  const { userStore } = useMst()
  const { currentUser, updateProfile } = userStore
  const { email, role, firstName, lastName, username, certified, organization } = currentUser

  const formMethods = useForm({
    mode: "onChange",
    defaultValues: {
      firstName,
      lastName,
      username,
      email,
      role,
      certified,
      organization,
    },
  })
  const { handleSubmit, formState, control } = formMethods
  const { isSubmitting } = formState

  const navigate = useNavigate()

  const onSubmit = async (formData) => {
    await updateProfile(formData)
  }

  return (
    <Container maxW="container.lg" p={8} as="main">
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Flex direction="column" w="full" gap={6}>
            <Heading as="h1">{t("user.myProfile")}</Heading>
            <InputGroup>
              <Flex direction="column" w="full">
                <FormLabel>{t("auth.role")}</FormLabel>
                <Select disabled defaultValue={role} w={{ base: "100%", md: "50%" }} textTransform="capitalize">
                  <option value={role}>{t(`user.roles.${role as EUserRoles}`)}</option>
                </Select>
              </Flex>
            </InputGroup>
            <Box as="section" gap={6} w="full" p={6} border="solid 1px" borderColor="border.light">
              <UsernameFormControl isDisabled />
              <EmailFormControl required mb={4} />
              <Flex gap={{ base: 4, md: 6 }} mb={4} direction={{ base: "column", md: "row" }}>
                <TextFormControl label={t("user.firstName")} fieldName="firstName" required />
                <TextFormControl label={t("user.lastName")} fieldName="lastName" required />
              </Flex>
              {currentUser.isSubmitter && (
                <>
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
                </>
              )}
            </Box>
            <Box as="section" gap={6} w="full" p={6} border="solid 1px" borderColor="border.light">
              <PasswordFormControl label={t("user.oldPassword")} fieldName="currentPassword" required={false} />
              <PasswordFormControl label={t("user.newPassword")} fieldName="password" required={false} validate />
            </Box>
            <Flex as="section" gap={4} mt={4}>
              <Button variant="primary" type="submit" isLoading={isSubmitting} loadingText={t("ui.loading")}>
                {t("ui.save")}
              </Button>
              <Button variant="secondary" isDisabled={isSubmitting} onClick={() => navigate(-1)}>
                {t("ui.cancel")}
              </Button>
            </Flex>
          </Flex>
        </form>
      </FormProvider>
    </Container>
  )
})
