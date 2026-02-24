import { observer } from "mobx-react-lite"
import React, { useEffect } from "react"
import { useParams } from "react-router-dom"
import { LoadingScreen } from "../../../shared/base/loading-screen"
import { BuildingEnvelope } from "./building-envelope"
import { BuildingLocation } from "./building-location"
import { CalculationsBasedOn } from "./calculations-based-on"
import { Compliance } from "./compliance"
import { Cooling } from "./cooling"
import { CoolingDesignConditions } from "./cooling-design-conditions"
import { Heating } from "./heating"
import { HeatingDesignConditions } from "./heating-design-conditions"
import { Introduction } from "./introduction"
import { RoomByRoom } from "./room-by-room"

export const FormSection = observer(function OverheatingCodeFormSection() {
  const { section } = useParams()

  useEffect(() => {
    const scroller = document.getElementById("overheatingCodeScroll")
    if (scroller) {
      scroller.scrollTo({ top: 0, left: 0, behavior: "auto" })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }
  }, [section])

  switch (section) {
    case "introduction":
      return <Introduction />
    case "building-location":
      return <BuildingLocation />
    case "compliance":
      return <Compliance />
    case "calculations-based-on":
      return <CalculationsBasedOn />
    case "heating":
      return <Heating />
    case "cooling":
      return <Cooling />
    case "heating-design-conditions":
      return <HeatingDesignConditions />
    case "cooling-design-conditions":
      return <CoolingDesignConditions />
    case "building-envelope":
      return <BuildingEnvelope />
    case "room-by-room":
      return <RoomByRoom />
    default:
      return <LoadingScreen />
  }
})
