import { Box, ListIcon, ListItem, Text, UnorderedList } from "@chakra-ui/react"
import { Check, X } from "@phosphor-icons/react"
import React from "react"
import { useTranslation } from "react-i18next"

interface IProps {
  password: string
}

export function PasswordChecklist({ password }: IProps) {
  const { t } = useTranslation()
  const passwordChecklist = [
    { requirement: t("auth.passwordChecklist.length"), isMet: password.length >= 8 && password.length <= 64 },
    {
      requirement: t("auth.passwordChecklist.uppercase"),
      isMet: /[A-Z]/.test(password),
    },
    {
      requirement: t("auth.passwordChecklist.lowercase"),
      isMet: /[a-z]/.test(password),
    },
    {
      requirement: t("auth.passwordChecklist.specialChar"),
      isMet: /[\W_]/.test(password),
    },
    { requirement: t("auth.passwordChecklist.number"), isMet: /\d/.test(password) },
  ]

  return (
    <Box as={"section"}>
      <Text as={"span"}>{t("auth.passwordChecklist.title")}</Text>
      <UnorderedList ml={0} pl={1} listStyleType={"none"} mt={1}>
        {passwordChecklist.map(({ requirement, isMet }) => (
          <ListItem key={requirement} color={isMet ? "success" : "error"}>
            <ListIcon as={isMet ? Check : X} />
            {requirement}
          </ListItem>
        ))}
      </UnorderedList>
    </Box>
  )
}
