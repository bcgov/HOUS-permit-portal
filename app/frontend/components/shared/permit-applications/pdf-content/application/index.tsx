import { Page, Text, View } from "@react-pdf/renderer"
import { t } from "i18next"
import * as R from "ramda"
import React, { useContext } from "react"
import { Footer } from "../shared/footer"
import { PermitApplicationContext } from "../shared/permit-application-context"
import { styles } from "./styles"

enum EComponentType {
  checkbox = "checkbox",
  container = "container",
  file = "file",
  number = "number",
  panel = "panel",
  select = "select",
  checklist = "selectboxes",
  email = "simpleemail",
  phone = "simplephonenumber",
  text = "simpletextfield",
  textarea = "textarea",
}

export const ApplicationFields = function ApplicationFields() {
  const permitApplication = useContext(PermitApplicationContext)

  return (
    <Page size="LETTER" style={styles.page}>
      <View style={styles.outerContainer}>
        {permitApplication.formattedFormJson.components.map((c) => (
          <FormComponent key={c.id} component={c} />
        ))}
      </View>
      <Footer />
    </Page>
  )
}

interface IFormComponentProps {
  component: any
  sectionKey?: string[]
}
const FormComponent = function ApplicationPDFFormComponent({ component, sectionKey }: IFormComponentProps) {
  const permitApplication = useContext(PermitApplicationContext)

  switch (component.type) {
    case EComponentType.container:
      const isValid = !R.isEmpty(component.title.trim()) && component.components?.length > 0
      if (!isValid) return null
      const { components } = component
      const firstChild: any = R.head(components)
      const additionalChildren: any = R.tail(components)

      return (
        <View>
          <View wrap={firstChild.components.length > 6}>
            <ContainerHeader component={component} />
            <FormComponent key={firstChild.id} component={firstChild} sectionKey={component.key} />
          </View>
          {additionalChildren.map((child) => (
            <FormComponent key={child.id} component={child} sectionKey={component.key} />
          ))}
        </View>
      )
    case EComponentType.panel:
      return (
        <View style={styles.panelContainer} wrap={component.components.length > 5}>
          <PanelHeader component={component} />
          {component.components && (
            <View style={styles.panelBodyContainer}>
              {component.components.map((child) => (
                <FormComponent key={child.id} component={child} sectionKey={sectionKey} />
              ))}
            </View>
          )}
        </View>
      )
    case EComponentType.file: {
      const value: any = R.path([sectionKey, component.key], permitApplication.submissionData.data)
      const label = component.label
      const isVisible = !R.isNil(value) && !R.isNil(label)

      return isVisible ? <FileField value={value} label={label} /> : null
    }
    case EComponentType.checklist:
      return <ChecklistField component={component} sectionKey={sectionKey} />
    case EComponentType.checkbox:
      return <CheckboxField component={component} sectionKey={sectionKey} />
    case EComponentType.select:
    case EComponentType.text:
    case EComponentType.textarea:
    case EComponentType.number:
    case EComponentType.phone:
    case EComponentType.email: {
      const value = R.path([sectionKey, component.key], permitApplication.submissionData.data)
      const label = component.label
      const isVisible = !R.isNil(value) && !R.isNil(label)
      return isVisible ? <InputField value={value} label={label} type={component.type} /> : null
    }
    default:
      return null
  }
}

const ContainerHeader = function ApplicationPDFContainerHeader({ component }) {
  return (
    <View style={styles.sectionHeaderContainer} wrap={false}>
      <View style={styles.sectionHeaderLine} />
      <Text style={styles.sectionHeading}>{component.title}</Text>
    </View>
  )
}

const PanelHeader = function ApplicationPDFPanelHeader({ component }) {
  return (
    <View style={styles.panelHeaderContainer} fixed>
      <Text style={styles.panelHeading}>{component.title}</Text>
    </View>
  )
}

const ChecklistField = function ApplicationPDFPanelChecklistField({ component, sectionKey }) {
  const permitApplication = useContext(PermitApplicationContext)
  let options = R.path([sectionKey, component.key], permitApplication.submissionData.data)
  let values: any = Object.keys(options).filter((key) => !!options[key])
  let label = component.label
  let isVisible = !R.isEmpty(values) && !R.isNil(label)

  return isVisible ? (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldChecklist}>
        {Object.keys(options).map((key) => {
          return (
            <View key={key} style={styles.requirementFieldChecklistItem}>
              {options[key] ? (
                <View style={styles.requirementFieldCheckboxFilled} />
              ) : (
                <View style={styles.requirementFieldCheckboxOutline} />
              )}
              <Text style={styles.requirementFieldInputValue}>{key}</Text>
            </View>
          )
        })}
      </View>
    </View>
  ) : null
}

const CheckboxField = function ApplicationPDFPanelCheckboxField({ component, sectionKey }) {
  const permitApplication = useContext(PermitApplicationContext)
  let value = R.path([sectionKey, component.key], permitApplication.submissionData.data)
  let label = component.label
  let isVisible = !R.isNil(value) && !R.isNil(label)
  return isVisible ? (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <View style={styles.requirementFieldChecklistItem}>
        {value ? (
          <View style={styles.requirementFieldCheckboxFilled} />
        ) : (
          <View style={styles.requirementFieldCheckboxOutline} />
        )}
        <Text style={styles.requirementFieldInputValue}>{label}</Text>
      </View>
    </View>
  ) : null
}

const InputField = function ApplicationPDFInputField({ value, label, type }) {
  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldInput}>
        <Text style={styles.requirementFieldInputValue}>{value}</Text>
      </View>
    </View>
  )
}

const FileField = function ApplicationPDFFileField({ value, label }: { value: Record<string, any>[]; label: string }) {
  const fileExists = value && !R.isEmpty(value)

  return (
    <View style={styles.requirementFieldContainer} wrap={false}>
      <Text style={styles.requirementFieldLabel}>{label}</Text>
      <View style={styles.requirementFieldInput}>
        {fileExists ? (
          <Text style={styles.requirementFieldInputValue}>{R.pluck("originalName", value).join(", ")}</Text>
        ) : (
          <Text style={styles.requirementFieldInputValue}>{t("permitApplication.fileNotAdded")}</Text>
        )}
      </View>
    </View>
  )
}
