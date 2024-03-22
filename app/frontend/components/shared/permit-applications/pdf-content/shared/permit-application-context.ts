import { createContext } from "react"
import { IPermitApplication } from "../../../../../models/permit-application"

export const PermitApplicationContext = createContext<IPermitApplication>(null)
