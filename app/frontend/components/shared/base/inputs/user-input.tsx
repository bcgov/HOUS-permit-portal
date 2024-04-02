import { Button, Flex, FormControl, FormLabel, HStack, Input, Select, Tag, Text } from "@chakra-ui/react"
import { CheckCircle, WarningCircle, X } from "@phosphor-icons/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMst } from "../../../../setup/root"
import { EUserRoles } from "../../../../types/enums"
import { EmailFormControl } from "../../form/email-form-control"
import { TextFormControl } from "../../form/input-form-control"
import { SharedSpinner } from "../shared-spinner"

interface IUserInputProps {
  index: number
  remove?: (index: number) => any
  jurisdictionId?: string
}

export const UserInput = observer(({ index, remove, jurisdictionId }: IUserInputProps) => {
  const { register, formState, control, watch } = useFormContext()
  const { isSubmitting } = formState
  const { t } = useTranslation()

  const emailWatch = watch(`users.${index}.email`)

  const { userStore } = useMst()
  const { invitedEmails, takenEmails } = userStore
  const invited = invitedEmails?.includes(emailWatch)
  const taken = takenEmails?.includes(emailWatch)

  return (
    <Flex bg="greys.grey03" p={4} borderRadius="md" flexWrap="wrap">
      <Input hidden {...register(`users.${index}.jurisdictionId`)} value={jurisdictionId} />
      <HStack spacing={4}>
        <FormControl>
          <FormLabel>{t("auth.role")}</FormLabel>
          <Controller
            name={`users.${index}.role`}
            control={control}
            rules={{ required: true }} // Inline validation rule
            render={({ field }) => (
              <>
                <Select bg="greys.white" placeholder={t("ui.pleaseSelect")} {...field}>
                  <option value="review_manager">{t(`user.roles.${EUserRoles.reviewManager}`)}</option>
                  <option value="reviewer">{t(`user.roles.${EUserRoles.reviewer}`)}</option>
                </Select>
              </>
            )}
          />
        </FormControl>
        <EmailFormControl fieldName={`users.${index}.email`} validate required />
        <TextFormControl label={t("user.firstName")} fieldName={`users.${index}.firstName`} required />
        <TextFormControl label={t("user.lastName")} fieldName={`users.${index}.lastName`} required />
        <Flex alignSelf="flex-end" align="flex-end">
          {isSubmitting && <SharedSpinner my={0} />}
          {invited && !taken && (
            <Tag bg="semantic.successLight" border="1px solid" borderColor="semantic.success">
              <HStack color="semantic.success">
                <CheckCircle size={20} />
                <Text>{t("user.inviteSuccess")}</Text>
              </HStack>
            </Tag>
          )}
          {taken && (
            <Tag bg="semantic.errorLight" border="1px solid" borderColor="semantic.error">
              <HStack color="semantic.error">
                <WarningCircle size={20} />
                <Text>{t("user.inviteError")}</Text>
              </HStack>
            </Tag>
          )}
          {!invited && !taken && remove && !isSubmitting && (
            <Button onClick={() => remove(index)} variant="tertiary" leftIcon={<X size={16} />}>
              {t("ui.remove")}
            </Button>
          )}
        </Flex>
      </HStack>
    </Flex>
  )
})
