import { Button, FormControl, FormErrorMessage, FormLabel, Input, Text, VStack } from "@chakra-ui/react"
import React, { FormEvent, useState } from "react"
import { useTranslation } from "react-i18next"
import { OMNIAUTH_PROVIDERS } from "../../../models/user"
import { useServerAPI } from "../../../setup/root"

export const IdirLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.idir} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.idirLogin")}
      </Button>
    </form>
  )
}
export const BcscLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bcsc} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bcscLogin")}
      </Button>
    </form>
  )
}
export const BceidLoginForm: React.FC = () => {
  // @ts-ignore
  const csrfToken = document.querySelector("[name=csrf-token]")?.content
  const { t } = useTranslation()

  return (
    <form action="/api/auth/keycloak" method="post">
      <input type="hidden" name="kc_idp_hint" value={OMNIAUTH_PROVIDERS.bceid} />
      <input type="hidden" name="authenticity_token" value={csrfToken} />
      <Button variant="primary" w="full" type="submit">
        {t("auth.bceidLogin")}
      </Button>
    </form>
  )
}

export const isLocalPasswordAuthEnabled =
  import.meta.env.DEV && import.meta.env.VITE_ENABLE_LOCAL_PASSWORD_AUTH === "true"

export const LocalPasswordLoginForm: React.FC = () => {
  const { t } = useTranslation()
  const api = useServerAPI()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    try {
      const response = await api.login({ email, password })
      if (response.ok) {
        window.location.replace("/")
        return
      }
      setError(t("auth.localPassword.error"))
    } catch {
      setError(t("auth.localPassword.error"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <VStack as="form" onSubmit={handleSubmit} align="stretch" gap={3} w="full">
      <Text fontWeight="bold">{t("auth.localPassword.title")}</Text>
      <Text fontSize="sm" color="text.secondary">
        {t("auth.localPassword.description")}
      </Text>
      <FormControl isRequired isInvalid={!!error}>
        <FormLabel>{t("auth.emailLabel")}</FormLabel>
        <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
      </FormControl>
      <FormControl isRequired isInvalid={!!error}>
        <FormLabel>{t("auth.localPassword.passwordLabel")}</FormLabel>
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <FormErrorMessage>{error}</FormErrorMessage>}
      </FormControl>
      <Button variant="secondary" w="full" type="submit" isLoading={isSubmitting}>
        {t("auth.localPassword.submit")}
      </Button>
    </VStack>
  )
}
