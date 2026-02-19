import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { CoverSheetForm } from "../cover-sheet-form"
import { InputSummaryForm } from "../input-summary-form"
import { RoomByRoomForm } from "../room-by-room-form"
import { ResultForm } from "./result-form"
import { ReviewForm } from "./review-form"
import { UploadsForm } from "./uploads-form"

export const FormSection = observer(function OverheatingToolFormSection() {
  const { hash } = useLocation()
  const section = (hash || "#compliance").slice(1)
  const formMethods = useForm({ mode: "onSubmit", reValidateMode: "onSubmit" })
  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  const sectionContent = () => {
    switch (section) {
      case "input-summary":
        return <InputSummaryForm />
      case "calculations":
        return <RoomByRoomForm />
      case "uploads":
        return <UploadsForm />
      case "review":
        return <ReviewForm />
      case "result":
        return <ResultForm />
      case "compliance":
      default:
        return <CoverSheetForm />
    }
  }

  return (
    <FormProvider {...formMethods}>
      <Box>{sectionContent()}</Box>
    </FormProvider>
  )
})
