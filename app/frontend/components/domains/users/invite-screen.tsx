import {
  Box,
  Button,
  Container,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  Select,
  Text,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, FormProvider, useFieldArray, useForm, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { EMAIL_REGEX } from "../../../constants"
import { useMst } from "../../../setup/root"
import { EUserRoles } from "../../../types/enums"

interface IInviteScreenProps {}

type TFormData = {
  users: { firstName: string; lastName: string; email: string; role: EUserRoles; jurisdictionId: string }[]
}

export const InviteScreen = ({}: IInviteScreenProps) => {
  const { t } = useTranslation()
  const {
    userStore: { invite },
    jurisdictionStore: { currentJurisdiction },
  } = useMst()

  // const [response, setResponse] = useState<IInvitationResponse>()

  const defaultUserValues = {
    email: "",
    firstName: "",
    lastName: "",
    role: EUserRoles.reviewManager,
    jurisdictionId: currentJurisdiction.id,
  }

  const formMethods = useForm<TFormData>({
    mode: "onSubmit",
    defaultValues: {
      users: [defaultUserValues],
    },
  })

  const { handleSubmit, formState, control, watch } = formMethods

  const { fields, append, remove } = useFieldArray({
    control,
    name: "users",
  })

  const { isSubmitting } = formState

  const onSubmit = async (formData) => {
    invite(formData)
  }

  const usersWatch = watch("users")

  return (
    <Flex direction="column" w="full" bg="greys.white">
      <Container maxW="container.lg" py={16} px={8}>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {fields.map((field, index) => (
              <UserInput key={field.id} index={index} remove={remove} />
            ))}

            <Button type="button" onClick={() => append(defaultUserValues)}>
              Add user
            </Button>

            <Button variant="primary" type="submit" isLoading={isSubmitting} loadingText={t("ui.loading")}>
              {t("admin.sendInvites")}
            </Button>
          </form>
        </FormProvider>
      </Container>
    </Flex>
  )
}

interface IUserInputProps {
  index: number
  remove: (index: number) => any
}

const UserInput = observer(({ index, remove }: IUserInputProps) => {
  const { register, formState, control, watch } = useFormContext()
  const { t } = useTranslation()

  const emailWatch = watch(`users.${index}.email`)

  const { userStore } = useMst()
  const { invitedEmails, takenEmails } = userStore
  const invited = invitedEmails?.includes(emailWatch)
  const taken = takenEmails?.includes(emailWatch)
  interface INameFieldProps {
    label: string
    index: number
    subFieldName: string
  }

  const NameFormControl = ({ label, index, subFieldName }: INameFieldProps) => {
    return (
      <FormControl mb={4} isInvalid={!!formState?.errors.users?.[index]?.[subFieldName]} flex={1}>
        <FormLabel>{label}</FormLabel>
        <InputGroup>
          <Flex w="full" direction="column">
            <Input
              {...register(`users.${index}.${subFieldName}`, {
                required: true,
                validate: {
                  satisfiesNameLength: (str) => (str.length >= 2 && str.length < 128) || t("ui.invalidInput"),
                },
              })}
              type={"text"}
            />
            {formState?.errors.users?.[index]?.[subFieldName] && (
              <FormErrorMessage>{formState?.errors.users[index][subFieldName].message as string}</FormErrorMessage>
            )}
          </Flex>
        </InputGroup>
      </FormControl>
    )
  }

  let borderColor = "border.light"
  if (invited) {
    borderColor = "success"
  } else if (taken) {
    borderColor = "error"
  }

  return (
    <Box border="1px solid" borderColor={borderColor}>
      {invited ? (
        <Text>User invited successfully!</Text>
      ) : (
        <>
          <Flex>
            <FormControl mb={4} isInvalid={!!formState?.errors?.users?.[index]?.email}>
              <FormLabel>{t("auth.emailLabel")}</FormLabel>
              <InputGroup>
                <Flex w="full" direction="column">
                  <Input
                    {...register(`users.${index}.email`, {
                      required: true,
                      validate: {
                        matchesEmailRegex: (str) => EMAIL_REGEX.test(str) || t("ui.invalidInput"),
                      },
                    })}
                    type={"text"}
                  />
                  {formState?.errors?.users?.[index]?.email && (
                    <FormErrorMessage>{formState?.errors?.users[index]?.email.message as string}</FormErrorMessage>
                  )}
                </Flex>
              </InputGroup>
            </FormControl>
            <Button onClick={() => remove(index)}>{t("ui.remove")}</Button>
          </Flex>
          <Flex>
            <NameFormControl label="First Name" index={index} subFieldName="firstName" />
            <NameFormControl label="Last Name" index={index} subFieldName="lastName" />
          </Flex>
          <FormControl mb={4}>
            <FormLabel>{t("auth.role")}</FormLabel>
            <Controller
              name={`users.${index}.role`}
              control={control}
              render={({ field }) => (
                <Select {...field}>
                  <option value="review_manager">Review Manager</option>
                  <option value="reviewer">Reviewer</option>
                </Select>
              )}
            />
          </FormControl>
        </>
      )}
    </Box>
  )
})
