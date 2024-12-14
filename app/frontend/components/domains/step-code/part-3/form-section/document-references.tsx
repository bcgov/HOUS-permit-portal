import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionItemProps,
  AccordionPanel,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { forwardRef, useCallback, useMemo } from "react"
import { FormProvider, useFieldArray, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { v4 as uuidv4 } from "uuid"
import { EDocumentReferenceDocumentType } from "../../../../../types/enums"
import { IDocumentReference } from "../../../../../types/types"
import { DatePickerFormControl, TextFormControl } from "../../../../shared/form/input-form-control"
import { HStack } from "../../part-9/checklist/pdf-content/shared/h-stack"

const i18nPrefix = "stepCode.part3.documentReferences"

type TDefaultDocumentType = Exclude<EDocumentReferenceDocumentType, "other">
type TOtherDocumentReferenceAnswer = "yes" | "no"
interface IDocumentReferenceStepCodeForm {
  defaultDocumentReferencesAttributes: (Exclude<IDocumentReference, "documentType"> & {
    documentType: TDefaultDocumentType
  })[]
  otherDocumentReferencesAttributes: (Exclude<IDocumentReference, "documentType"> & {
    documentType: EDocumentReferenceDocumentType.other
  })[]
}

const largeInputWidth = "26.875rem"
const smallInputWidth = "12.5rem"

function initializeDocumentReferenceForm(
  documentReferencesAttributes: IDocumentReference[] | undefined
): IDocumentReferenceStepCodeForm {
  const otherDocumentReferencesAttributes = (documentReferencesAttributes
    ?.filter((documentReference) => documentReference.documentType === EDocumentReferenceDocumentType.other)
    ?.map((documentReference) => ({
      ...documentReference,
      dateIssued:
        typeof documentReference?.dateIssued === "number"
          ? new Date(documentReference?.dateIssued)
          : documentReference?.dateIssued,
    })) ?? []) as IDocumentReferenceStepCodeForm["otherDocumentReferencesAttributes"]
  const defaultDocumentReferencesAttributes: IDocumentReferenceStepCodeForm["defaultDocumentReferencesAttributes"] =
    Object.values(EDocumentReferenceDocumentType)
      .filter((documentType) => documentType !== EDocumentReferenceDocumentType.other)
      .map((documentType) => {
        const existingDocumentReference = documentReferencesAttributes?.find(
          (documentReference) => documentReference.documentType === documentType
        )
        return {
          ...(existingDocumentReference ?? {}),
          documentType,
          dateIssued:
            typeof existingDocumentReference?.dateIssued === "number"
              ? new Date(existingDocumentReference?.dateIssued)
              : existingDocumentReference?.dateIssued,
        }
      })

  return {
    defaultDocumentReferencesAttributes,
    otherDocumentReferencesAttributes,
  }
}

export const DocumentReferences = observer(function DocumentaReferences() {
  const { t } = useTranslation()
  const formMethods = useForm<IDocumentReferenceStepCodeForm>({
    mode: "onChange",
    defaultValues: initializeDocumentReferenceForm(undefined),
  })
  const { fields: defaultDocumentReferencesAttributes } = useFieldArray({
    control: formMethods.control,
    name: "defaultDocumentReferencesAttributes",
  })
  const {
    fields: otherDocumentReferencesAttributes,
    append,
    remove,
  } = useFieldArray({
    control: formMethods.control,
    name: "otherDocumentReferencesAttributes",
  })

  const handleAddOtherDocumentReferenceAnswer = useCallback(
    (answer: TOtherDocumentReferenceAnswer) => {
      if (answer === "yes") {
        append({ documentType: EDocumentReferenceDocumentType.other })
      }
    },
    [append]
  )

  const handleRemoveOtherDocumentReference = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove]
  )

  return (
    <Stack direction="column" w="full">
      <Heading as="h2" fontSize="2xl" variant="yellowline">
        {t(`${i18nPrefix}.heading`)}
      </Heading>

      <FormProvider {...formMethods}>
        <Stack as="form" spacing={7} mt={3}>
          <Accordion as={Stack} spacing={2} allowToggle allowMultiple>
            {defaultDocumentReferencesAttributes.map((field, index) => (
              <DocumentReferenceAccordionItem key={field.id} documentType={field.documentType} index={index} />
            ))}
          </Accordion>
          <Stack spacing={"1.844rem"}>
            {otherDocumentReferencesAttributes.map((field, index) => (
              <OtherDocumentReferenceFormFields
                key={field.id}
                index={index}
                onRemove={handleRemoveOtherDocumentReference}
              />
            ))}
            <AdditionalDocumentsQuestion value="no" onChange={handleAddOtherDocumentReferenceAnswer} />
          </Stack>
        </Stack>
      </FormProvider>
    </Stack>
  )
})

interface IDocumentReferenceAccordionItemProps extends AccordionItemProps {
  documentType: TDefaultDocumentType
  index: number
}

/**
 * A component that displays default document reference in an accordion.
 * @component
 */
export const DocumentReferenceAccordionItem = observer(
  forwardRef<HTMLDivElement, IDocumentReferenceAccordionItemProps>(function DocumentReferenceAccordionItem(
    { documentType, index, ...props },
    ref
  ) {
    const { t } = useTranslation()

    const datePickerPortalId = `datePickerPortal-${documentType}`

    return (
      <AccordionItem border="none" ref={ref} {...props}>
        <h3>
          <AccordionButton background={"greys.grey04"} borderTopRadius={"lg"} px={6}>
            <Box as="span" flex="1" textAlign="left" fontWeight={"bold"}>
              {t(`${i18nPrefix}.documentTypes.${documentType}`)}
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h3>
        <AccordionPanel as={Stack} spacing={8} px={6} pt={4} pb={"1.8rem"}>
          <TextFormControl
            maxW={largeInputWidth}
            fieldName={`defaultDocumentReferencesAttributes.${index}.documentName`}
            label={t(`${i18nPrefix}.documentFields.documentName`)}
            showOptional={false}
            required
          />

          {/* The date picker portal is needed to ensure the date picker is not cut off by the accordion */}
          <Box id={datePickerPortalId}>
            <DatePickerFormControl
              fieldName={`defaultDocumentReferencesAttributes.${index}.dateIssued`}
              label={t(`${i18nPrefix}.documentFields.dateIssued`)}
              showOptional={false}
              inputProps={{
                portalId: datePickerPortalId,
                isClearable: true,
              }}
              maxW={smallInputWidth}
              required
            />
          </Box>
          <TextFormControl
            maxW={largeInputWidth}
            fieldName={`defaultDocumentReferencesAttributes.${index}.preparedBy`}
            label={t(`${i18nPrefix}.documentFields.preparedBy`)}
            showOptional={false}
            required
          />
        </AccordionPanel>
      </AccordionItem>
    )
  })
)

interface IOtherDocumentReferenceFormProps {
  index: number
  onRemove: (index: number) => void
}

/**
 * A component with form fields for additional document references.
 * @component
 */
function OtherDocumentReferenceFormFields({ index, onRemove }: IOtherDocumentReferenceFormProps) {
  const { t } = useTranslation()

  const datePickerPortalId = useMemo(() => `datePickerPortalOther-${uuidv4()}`, [])

  const handleAddOtherDocumentReferenceAnswer = useCallback(
    (answer: TOtherDocumentReferenceAnswer) => {
      if (answer === "no") {
        onRemove(index)
      }
    },
    [onRemove, index]
  )

  return (
    <>
      <AdditionalDocumentsQuestion value="yes" onChange={handleAddOtherDocumentReferenceAnswer} />
      <Stack gap={8}>
        <TextFormControl
          maxW={largeInputWidth}
          label={t(`${i18nPrefix}.documentFields.documentTypeDescription`)}
          fieldName={`otherDocumentReferencesAttributes.${index}}.documentName`}
          required
        />
        <TextFormControl
          maxW={largeInputWidth}
          label={t(`${i18nPrefix}.documentFields.documentName`)}
          fieldName={`otherDocumentReferencesAttributes.${index}}.documentName`}
          required
        />
        <TextFormControl
          maxW={largeInputWidth}
          label={t(`${i18nPrefix}.documentFields.issuedFor`)}
          fieldName={`otherDocumentReferencesAttributes.${index}}.issuedFor`}
          required
        />
        {/* The date picker portal is needed to ensure the date picker is not cut off by the accordion */}
        <Box id={datePickerPortalId}>
          <DatePickerFormControl
            maxW={smallInputWidth}
            fieldName={`otherDocumentReferencesAttributes.${index}}.dateIssued`}
            label={t(`${i18nPrefix}.documentFields.dateIssued`)}
            showOptional={false}
            inputProps={{
              portalId: datePickerPortalId,
              isClearable: true,
            }}
          />
        </Box>
      </Stack>
    </>
  )
}

const sharedRadioContainerProps = {
  border: "1px solid",
  borderColor: "border.base",
  px: 4,
  py: 3,
  borderRadius: "md",
}

interface IAdditionalDocumentsQuestionProps {
  value: TOtherDocumentReferenceAnswer
  onChange: (value: TOtherDocumentReferenceAnswer) => void
}

function getRadioBackgroundColor(
  currentValue: TOtherDocumentReferenceAnswer,
  optionValue: TOtherDocumentReferenceAnswer
) {
  return currentValue === optionValue ? "theme.blueLight" : undefined
}

/**
 * A question component that asks if the user has additional documents.
 * @component
 */
export function AdditionalDocumentsQuestion({ value = "no", onChange }: IAdditionalDocumentsQuestionProps) {
  const { t } = useTranslation()

  return (
    <FormControl>
      <FormLabel>{t(`${i18nPrefix}.otherDocumentQuestion`)}</FormLabel>
      <RadioGroup value={value} onChange={onChange} as={HStack} gap={"1rem !important"} mt={3}>
        <Flex
          justifyContent="center"
          alignItems="center"
          {...sharedRadioContainerProps}
          bg={getRadioBackgroundColor(value, "yes")}
        >
          <Radio value="yes">{t(`${i18nPrefix}.otherDocumentAnswers.yes`)}</Radio>
        </Flex>
        <Flex
          justifyContent="center"
          alignItems="center"
          {...sharedRadioContainerProps}
          bg={getRadioBackgroundColor(value, "no")}
        >
          <Radio value="no">{t(`${i18nPrefix}.otherDocumentAnswers.no`)}</Radio>
        </Flex>
      </RadioGroup>
    </FormControl>
  )
}
