import { Box, useToast } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { CoverSheetForm } from "../cover-sheet-form"
import { InputSummaryForm } from "../input-summary-form"
import { RoomByRoomForm } from "../room-by-room-form"
import { ResultForm } from "./result-form"
import { ReviewForm } from "./review-form"
import { UploadsForm } from "./uploads-form"

export const FormSection = observer(function SingleZoneCoolingHeatingToolFormSection() {
  const { hash } = useLocation()
  const section = (hash || "#compliance").slice(1)
  const formMethods = useForm({ mode: "onSubmit", reValidateMode: "onSubmit" })
  const { pdfFormStore } = useMst()
  const toast = useToast()

  const handleNextFromCoverSheet = () => {
    window.location.hash = "#input-summary"
  }

  const handleNextRoomByRoom = () => {
    window.location.hash = "#calculations"
  }

  const handleSubmit = async () => {
    window.location.hash = "#uploads"
  }

  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  switch (section) {
    case "compliance":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <CoverSheetForm onNext={handleNextFromCoverSheet} />
          </Box>
        </FormProvider>
      )
    case "input-summary":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <InputSummaryForm onNext={handleNextRoomByRoom} />
          </Box>
        </FormProvider>
      )
    case "calculations":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <RoomByRoomForm onSubmit={handleSubmit} />
          </Box>
        </FormProvider>
      )
    case "uploads":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <UploadsForm />
          </Box>
        </FormProvider>
      )
    case "review":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <ReviewForm />
          </Box>
        </FormProvider>
      )
    case "result":
      return (
        <FormProvider {...formMethods}>
          <Box>
            <ResultForm />
          </Box>
        </FormProvider>
      )
    default:
      return (
        <FormProvider {...formMethods}>
          <Box>
            <CoverSheetForm onNext={handleNextFromCoverSheet} />
          </Box>
        </FormProvider>
      )
  }
})
