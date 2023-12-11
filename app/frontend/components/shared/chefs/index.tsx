// The custom components in this directory are from the CHEFS codebase https://github.com/bcgov/common-hosted-form-service/tree/master/components
import { Form, Formio } from "@formio/react"
import "bootstrap/dist/css/bootstrap.min.css"
import "formiojs/dist/formio.form.css"
import ChefsFormioComponents from "./custom-formio-components"

Formio.use(ChefsFormioComponents)

export { Form, Formio }
