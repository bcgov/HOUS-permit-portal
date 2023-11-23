import { createContext } from "react"
import { RootInstance } from "./root"

export const RootStoreContext = createContext<null | RootInstance>(null)
