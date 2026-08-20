import "@uppy/core/dist/style.min.css"
import Dashboard from "@uppy/react/lib/Dashboard.js"
import React, { ComponentProps } from "react"

type UppyDashboardProps = ComponentProps<typeof Dashboard>

/**
 * App-wide Uppy Dashboard defaults. Always allow removing a completed upload so
 * users can replace a file without remounting the form.
 */
export const UppyDashboard = (props: UppyDashboardProps) => (
  <Dashboard proudlyDisplayPoweredByUppy={false} showRemoveButtonAfterComplete {...props} />
)
