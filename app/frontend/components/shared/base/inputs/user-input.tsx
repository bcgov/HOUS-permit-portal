import { Box, Button, Flex, FormControl, FormLabel, Input, InputGroup, Select, Tag } from "@chakra-ui/react"
import { CheckCircle, UserMinus, WarningCircle } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../../constants"
import { useMst } from "../../../../setup/root"

interface IUserInputProps {
  index: number
  remove?: (index: number) => any
  jurisdictionId?: string
}

export const UserInput = observer(({ index, remove, jurisdictionId }: IUserInputProps) => {
  const { register, formState, control, watch } = useFormContext()
  const { t } = useTranslation()

  const emailWatch = watch(`users.${index}.email`)

  const { userStore } = useMst()
  const { invitedEmails, takenEmails } = userStore
  const invited = invitedEmails?.includes(emailWatch)
  const taken = takenEmails?.includes(emailWatch)

  return (
    <Flex bg="greys.grey03" p={2} borderRadius="sm" flexWrap="wrap">
      <Input hidden {...register(`users.${index}.jurisdictionId`)} value={jurisdictionId} />
      <Flex gap={4} align="flex-end">
        <FormControl flex={2}>
          <FormLabel>{t("auth.role")}</FormLabel>
          <Controller
            name={`users.${index}.role`}
            control={control}
            render={({ field }) => (
              <Select bg="greys.white" {...field}>
                <option value="review_manager">Review Manager</option>
                <option value="reviewer">Reviewer</option>
              </Select>
            )}
          />
        </FormControl>
        <FormControl isInvalid={!!formState?.errors?.users?.[index]?.email} flex={3}>
          <FormLabel>{t("auth.emailLabel")}</FormLabel>
          <InputGroup>
            <Flex w="full" direction="column">
              <Input
                bg="greys.white"
                {...register(`users.${index}.email`, {
                  required: true,
                  validate: {
                    matchesEmailRegex: (str) => EMAIL_REGEX.test(str) || t("ui.invalidInput"),
                  },
                })}
                type={"text"}
              />
            </Flex>
          </InputGroup>
        </FormControl>
        <NameFormControl label="First Name (optional)" index={index} subFieldName="firstName" />
        <NameFormControl label="Last Name (optional)" index={index} subFieldName="lastName" />
        {invited && (
          <Tag bg="semantic.successLight" border="1px solid" borderColor="semantic.success" mb={2}>
            <Box color="semantic.success">
              <CheckCircle size={20} /> {t("user.inviteSuccess")}
            </Box>
          </Tag>
        )}
        {taken && (
          <Tag bg="semantic.errorLight" border="1px solid" borderColor="semantic.error" mb={2}>
            <Box color="semantic.error">
              <WarningCircle size={20} /> {t("user.inviteError")}
            </Box>
          </Tag>
        )}
        {!invited && !taken && remove && (
          <Button onClick={() => remove(index)} variant="tertiary" leftIcon={<UserMinus size={16} />}>
            {t("ui.remove")}
          </Button>
        )}
      </Flex>
    </Flex>
  )
})

interface INameFormControlProps {
  label: string
  index: number
  subFieldName: string
}

const NameFormControl = ({ label, index, subFieldName }: INameFormControlProps) => {
  const { register, formState } = useFormContext()
  const { t } = useTranslation()

  return (
    <FormControl isInvalid={!!formState?.errors.users?.[index]?.[subFieldName]} flex={2}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <Flex w="full" direction="column">
          <Input
            bg="greys.white"
            {...register(`users.${index}.${subFieldName}`, {
              validate: {
                satisfiesNameLength: (str) => !str || (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
              },
            })}
            type={"text"}
          />
        </Flex>
      </InputGroup>
    </FormControl>
  )
}
