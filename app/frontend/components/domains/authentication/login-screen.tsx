import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
} from "@chakra-ui/react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../setup/root"
import { CenterContainer } from "../../shared/center-container"

interface ILoginScreenProps {}

export const LoginScreen = ({}: ILoginScreenProps) => {
  const { t } = useTranslation()
  const { register, handleSubmit, formState } = useForm()
  const {
    sessionStore: { login },
  } = useMst()

  const onSubmit = (formData) => {
    login(formData.username, formData.password)
  }

  const [showPassword, setShowPassword] = useState(false)

  return (
    <CenterContainer>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Flex direction="column" gap={6} w="full" p={10} border="solid 1px" borderColor="gray.300" background="white">
          <Flex gap={2} direction="column">
            <Heading>{t("login.login")}</Heading>
            <Text>{t("login.description")}</Text>
          </Flex>

          <Box>
            <FormControl mb={4}>
              <FormLabel>{t("login.usernameLabel")}</FormLabel>
              <Input
                {...register("username", {
                  required: true,
                })}
                autoFocus
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>{t("login.passwordLabel")}</FormLabel>
              <InputGroup>
                <Input
                  {...register("password", {
                    required: true,
                  })}
                  type={showPassword ? "text" : "password"}
                />
                <InputRightElement pr={14} py={1}>
                  <Divider orientation="vertical" borderLeft="1px solid" borderColor="gray.400" />
                  <Button
                    variant="link"
                    color="utility.link"
                    ml={6}
                    onClick={() => setShowPassword(() => !showPassword)}
                  >
                    {showPassword ? t("ui.hide") : t("ui.show")}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>

          <HStack gap={4}>
            <Button type="submit">{t("login.login")}</Button>
            <Button variant="outline">{t("ui.back")}</Button>
          </HStack>

          <Flex gap={2}>
            <Link>{t("login.forgotYourPassword")}</Link>
            {" | "}
            <Link>{t("login.registerForAccount")}</Link>
          </Flex>
        </Flex>
      </form>
    </CenterContainer>
  )
}
