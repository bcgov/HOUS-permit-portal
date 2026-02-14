import { Box } from "@chakra-ui/react"
import { observer } from "mobx-react-lite"
import React, { useEffect, useRef } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useLocation } from "react-router-dom"
import { useMst } from "../../../../setup/root"
import { CoverSheetForm } from "../cover-sheet-form"
import { InputSummaryForm } from "../input-summary-form"
import { RoomByRoomForm } from "../room-by-room-form"
import { ResultForm } from "./result-form"
import { ReviewForm } from "./review-form"
import { UploadsForm } from "./uploads-form"

export const FormSection = observer(function OverheatingToolFormSection() {
  const { hash, search } = useLocation()
  const section = (hash || "#compliance").slice(1)
  const formMethods = useForm({ mode: "onSubmit", reValidateMode: "onSubmit" })
  const { overheatingToolStore } = useMst()
  const autosaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<string>("")
  const isHydratingRef = useRef<boolean>(false)
  useEffect(() => {
    const scroller = document.getElementById("stepCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  useEffect(() => {
    let isMounted = true
    const loadDraft = async () => {
      const params = new URLSearchParams(search)
      if (params.get("new") === "true") {
        overheatingToolStore.setLastCreatedTool(null as any)
        isHydratingRef.current = true
        formMethods.reset({})
        isHydratingRef.current = false
        return
      }
      const toolId = params.get("toolId")
      if (toolId) {
        const result = await overheatingToolStore.fetchOverheatingTool(toolId)
        if (!isMounted || !(result as any)?.success) return
        overheatingToolStore.setLastCreatedTool(toolId)
        const tool = overheatingToolStore.overheatingToolsMap.get(toolId)
        if (!tool) return
        const overheatingDocumentsAttributes = tool.overheatingDocuments || []
        isHydratingRef.current = true
        formMethods.reset({
          ...(tool.formJson || {}),
          overheatingDocumentsAttributes,
        })
        isHydratingRef.current = false
        return
      }
      const result = await overheatingToolStore.searchOverheatingTools({ page: 1, countPerPage: 10, reset: true })
      if (!isMounted || !(result as any)?.success) return
      const draft = overheatingToolStore.overheatingTools.find((tool) => tool.rollupStatus === "new_draft")
      if (!draft) return
      overheatingToolStore.setLastCreatedTool(draft.id)
      const overheatingDocumentsAttributes = draft.overheatingDocuments || []
      isHydratingRef.current = true
      formMethods.reset({
        ...(draft.formJson || {}),
        overheatingDocumentsAttributes,
      })
      isHydratingRef.current = false
    }
    loadDraft()
    return () => {
      isMounted = false
    }
  }, [formMethods, overheatingToolStore, search])

  useEffect(() => {
    const subscription = formMethods.watch(() => {
      if (isHydratingRef.current) return
      const values = formMethods.getValues() || {}
      const projectNumber = values?.projectNumber
      if (!projectNumber || String(projectNumber).trim() === "") return

      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current)
      }

      autosaveTimeoutRef.current = setTimeout(async () => {
        const { overheatingDocumentsAttributes, ...formJson } = formMethods.getValues()
        const payload = JSON.stringify({ formJson, overheatingDocumentsAttributes })
        if (payload === lastSavedRef.current) return
        lastSavedRef.current = payload
        await overheatingToolStore.saveOverheatingToolDraft({
          formJson,
          formType: "single_zone_cooling_heating_tool",
          overheatingDocumentsAttributes,
        })
      }, 800)
    })

    return () => subscription.unsubscribe()
  }, [formMethods, overheatingToolStore])

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
