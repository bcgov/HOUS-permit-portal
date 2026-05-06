import { Box, Field, Heading, Input, Text, VStack } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useOverheatingCode } from "../../../../hooks/resources/use-overheating-code"
import { useMst } from "../../../../setup/root"
import { EFlashMessageStatus } from "../../../../types/enums"
import { CustomMessageBox } from "../../../shared/base/custom-message-box"
import { FormFooter } from "./form-footer"

interface IIntroductionFormData {
  issuedTo: string
  projectNumber: string
}

export const Introduction = observer(function Introduction() {
  const { t } = useTranslation()
  const { currentOverheatingCode } = useOverheatingCode()
  const {
    overheatingCodeStore: { updateOverheatingCode },
  } = useMst()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IIntroductionFormData>({
    mode: "onChange",
    defaultValues: {
      issuedTo: currentOverheatingCode?.issuedTo || "",
      projectNumber: currentOverheatingCode?.projectNumber || "",
    },
  })

  const onSubmit = async (data: IIntroductionFormData) => {
    if (!currentOverheatingCode) return
    await updateOverheatingCode(currentOverheatingCode.id, {
      issuedTo: data.issuedTo,
      projectNumber: data.projectNumber,
    })
  }

  return (
    <Box>
      <CustomMessageBox
        status={EFlashMessageStatus.info}
        title={t(
          "overheatingCode.sections.introduction.standardTitle",
          "B.C. Single Zone Cooling Capacity — BCBC 9.33.3.1.; 9.33.5.1."
        )}
        description={t("overheatingCode.sections.introduction.formVersion", "B.C. SZCG Form Set Ver 1.0")}
        mb={6}
      />
      <Heading as="h2" size="lg" mb={2}>
        {t("overheatingCode.sections.introduction.title", "Overheating Code Check")}
      </Heading>
      <Text mb={6} color="text.secondary">
        {t(
          "overheatingCode.sections.introduction.description",
          "Provide basic project identification details to get started with your overheating code compliance check."
        )}
      </Text>
      <VStack gap={6} align="stretch">
        <Field.Root invalid={!!errors.issuedTo}>
          <Field.Label>
            {t("overheatingCode.sections.introduction.issuedToLabel", "These documents issued for the use of")}
          </Field.Label>
          <Input
            {...register("issuedTo", {
              required: t(
                "overheatingCode.sections.introduction.issuedToRequired",
                "Please enter who these documents are issued for"
              ),
            })}
            placeholder={t(
              "overheatingCode.sections.introduction.issuedToPlaceholder",
              "e.g. Jane Smith, ABC Construction Ltd."
            )}
          />
          <Field.ErrorText>{errors.issuedTo?.message}</Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={!!errors.projectNumber}>
          <Field.Label>{t("overheatingCode.sections.introduction.projectNumberLabel", "Project #")}</Field.Label>
          <Input
            {...register("projectNumber", {
              required: t(
                "overheatingCode.sections.introduction.projectNumberRequired",
                "Please enter a project number"
              ),
            })}
            placeholder={t("overheatingCode.sections.introduction.projectNumberPlaceholder", "e.g. 2026-001")}
          />
          <Field.ErrorText>{errors.projectNumber?.message}</Field.ErrorText>
        </Field.Root>
      </VStack>
      <FormFooter<IIntroductionFormData> handleSubmit={handleSubmit} onSubmit={onSubmit} loading={isSubmitting} />
    </Box>
  )
})
