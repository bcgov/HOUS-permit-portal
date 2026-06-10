import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React from "react"
import { Controller, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { IProjectMeeting } from "../../../../../models/project-meeting"
import { useMst } from "../../../../../setup/root"
import { EFlashMessageStatus, EProjectMeetingContactMethod } from "../../../../../types/enums"
import { DatePicker } from "../../../../shared/date-picker"

interface ScheduleMeetingBannerProps {
  projectMeeting: IProjectMeeting
  mode?: "schedule" | "reschedule"
  onCancel?: () => void
}

type ScheduleMeetingFormValues = {
  contactMethod: EProjectMeetingContactMethod | ""
  confirmedDate: Date | null
  confirmedTime: string
  meetingUrl: string
}

const timeValueFromDate = (date?: Date | null) => {
  if (!date) return ""

  const hours = date.getHours().toString().padStart(2, "0")
  const minutes = date.getMinutes().toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

const combineDateAndTime = (date: Date | null, time: string) => {
  if (!date || !time) return null

  const [hours, minutes] = time.split(":").map(Number)
  const combinedDate = new Date(date)
  combinedDate.setHours(hours, minutes, 0, 0)
  return combinedDate
}

const normalizeUrl = (url: string) => {
  const trimmedUrl = url.trim()
  if (!trimmedUrl) return trimmedUrl
  return /^(https?):\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`
}

export const ScheduleMeetingBanner = observer(
  ({ projectMeeting, mode = "schedule", onCancel }: ScheduleMeetingBannerProps) => {
    const { t } = useTranslation()
    const { projectMeetingStore, uiStore } = useMst()
    const initialValues: ScheduleMeetingFormValues = {
      contactMethod: (projectMeeting.contactMethod || "") as EProjectMeetingContactMethod | "",
      confirmedDate: projectMeeting.confirmedDate ? new Date(projectMeeting.confirmedDate) : null,
      confirmedTime: timeValueFromDate(projectMeeting.confirmedDate),
      meetingUrl: projectMeeting.meetingUrl || "",
    }
    const {
      control,
      formState: { errors, isSubmitting },
      handleSubmit,
      register,
      reset,
      watch,
    } = useForm<ScheduleMeetingFormValues>({
      defaultValues: initialValues,
    })

    const selectedContactMethod = watch("contactMethod")
    const contactMethodOptions = Object.values(EProjectMeetingContactMethod)

    const handleClear = () => {
      reset(
        mode === "reschedule"
          ? initialValues
          : {
              contactMethod: "",
              confirmedDate: null,
              confirmedTime: "",
              meetingUrl: "",
            }
      )
    }

    const onSubmit = async (data: ScheduleMeetingFormValues) => {
      const confirmedDate = combineDateAndTime(data.confirmedDate, data.confirmedTime)
      if (!confirmedDate) return

      const meetingUrl =
        data.contactMethod === EProjectMeetingContactMethod.videoconference ? normalizeUrl(data.meetingUrl) : null

      const params = {
        contactMethod: data.contactMethod,
        confirmedDate: confirmedDate.toISOString(),
        meetingUrl,
      }
      const response =
        mode === "reschedule"
          ? await projectMeetingStore.rescheduleProjectMeeting(
              projectMeeting.permitProjectId,
              projectMeeting.id,
              params
            )
          : await projectMeetingStore.scheduleProjectMeeting(projectMeeting.permitProjectId, projectMeeting.id, params)

      if (!response.ok) {
        uiStore.flashMessage.show(
          EFlashMessageStatus.error,
          null,
          t(
            mode === "reschedule"
              ? "projectMeeting.detail.reviewer.rescheduleError"
              : "projectMeeting.detail.reviewer.scheduleError"
          ),
          5000
        )
        return
      }

      if (mode === "reschedule") {
        uiStore.flashMessage.show(
          EFlashMessageStatus.success,
          null,
          t("projectMeeting.detail.reviewer.rescheduleSuccess"),
          5000
        )
        onCancel?.()
      }
    }

    return (
      <Box bg="theme.blueLight" borderRadius="lg" p={5} mb={8} maxW="xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold" fontSize="lg" mb={2}>
                {t(
                  mode === "reschedule"
                    ? "projectMeeting.detail.reviewer.rescheduleTitle"
                    : "projectMeeting.detail.reviewer.scheduleTitle"
                )}
              </Text>
              <Text fontSize="lg">
                {t(
                  mode === "reschedule"
                    ? "projectMeeting.detail.reviewer.rescheduleDescription"
                    : "projectMeeting.detail.reviewer.scheduleDescription"
                )}
              </Text>
            </Box>

            <FormControl isRequired isInvalid={!!errors.contactMethod}>
              <FormLabel>{t("projectMeeting.detail.reviewer.contactMethod")}</FormLabel>
              <Controller
                name="contactMethod"
                control={control}
                rules={{ required: t("projectMeeting.detail.reviewer.contactMethodRequired") }}
                render={({ field }) => (
                  <RadioGroup value={field.value} onChange={field.onChange}>
                    <Stack spacing={2}>
                      {contactMethodOptions.map((contactMethod) => (
                        <Radio key={contactMethod} value={contactMethod}>
                          {t(`projectMeeting.contactMethods.${contactMethod}`)}
                        </Radio>
                      ))}
                    </Stack>
                  </RadioGroup>
                )}
              />
              <FormErrorMessage>{errors.contactMethod?.message as string}</FormErrorMessage>
            </FormControl>

            {selectedContactMethod === EProjectMeetingContactMethod.videoconference && (
              <FormControl isRequired isInvalid={!!errors.meetingUrl}>
                <FormLabel>{t("projectMeeting.detail.reviewer.meetingLink")}</FormLabel>
                <Input
                  type="text"
                  placeholder="https://"
                  bg="white"
                  {...register("meetingUrl", {
                    required: t("projectMeeting.detail.reviewer.meetingLinkRequired"),
                  })}
                />
                <FormErrorMessage>{errors.meetingUrl?.message as string}</FormErrorMessage>
              </FormControl>
            )}

            <FormControl isRequired isInvalid={!!errors.confirmedDate}>
              <FormLabel>{t("projectMeeting.detail.reviewer.meetingDate")}</FormLabel>
              <Controller
                name="confirmedDate"
                control={control}
                rules={{ required: t("projectMeeting.detail.reviewer.meetingDateRequired") }}
                render={({ field }) => (
                  <DatePicker
                    selected={field.value}
                    onChange={field.onChange}
                    minDate={new Date()}
                    containerProps={{
                      w: "full",
                      sx: {
                        ".react-datepicker-wrapper": { w: "full" },
                        ".react-datepicker__input-container": { w: "full" },
                      },
                    }}
                  />
                )}
              />
              <FormErrorMessage>{errors.confirmedDate?.message as string}</FormErrorMessage>
            </FormControl>

            <FormControl isRequired isInvalid={!!errors.confirmedTime}>
              <FormLabel>{t("projectMeeting.detail.reviewer.meetingTime")}</FormLabel>
              <Input
                type="time"
                bg="white"
                {...register("confirmedTime", {
                  required: t("projectMeeting.detail.reviewer.meetingTimeRequired"),
                })}
              />
              <FormErrorMessage>{errors.confirmedTime?.message as string}</FormErrorMessage>
            </FormControl>

            <HStack spacing={3}>
              <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                {t(
                  mode === "reschedule"
                    ? "projectMeeting.detail.reviewer.resetMeetingDetailsForm"
                    : "projectMeeting.detail.reviewer.clearScheduleForm"
                )}
              </Button>
              {onCancel && (
                <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
                  {t("projectMeeting.detail.reviewer.cancelEditMeetingDetails")}
                </Button>
              )}
              <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                {t(
                  mode === "reschedule"
                    ? "projectMeeting.detail.reviewer.sendUpdatedMeetingDetails"
                    : "projectMeeting.detail.reviewer.sendMeetingDetails"
                )}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
    )
  }
)
