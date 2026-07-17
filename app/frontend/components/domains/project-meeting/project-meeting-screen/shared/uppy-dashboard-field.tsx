import { Box } from "@chakra-ui/react"
import { Uppy } from "@uppy/core"
import "@uppy/core/dist/style.min.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React from "react"

const uppyDashboardSx = {
  ".uppy-Dashboard": { width: "100%" },
  ".uppy-Container": { width: "100%" },
  ".uppy-Dashboard-inner": { width: "100%" },
  ".uppy-Dashboard-innerWrap": { width: "100%" },
  ".uppy-Dashboard-AddFiles": { width: "100%" },
}

interface UppyDashboardFieldProps {
  uppy: Uppy
  mb?: number
}

export const UppyDashboardField = ({ uppy, mb = 6 }: UppyDashboardFieldProps) => (
  <Box position="relative" w="100%" mb={mb} sx={uppyDashboardSx}>
    <Dashboard uppy={uppy} width="100%" height={220} proudlyDisplayPoweredByUppy={false} />
  </Box>
)
