import { observer } from "mobx-react-lite"
import React, { Suspense } from "react"
import { useJurisdiction } from "../../../../../../../hooks/resources/use-jurisdiction"
import { ErrorScreen } from "../../../../../../shared/base/error-screen"
import { LoadingScreen } from "../../../../../../shared/base/loading-screen"

export const EnergyStepEditableBlock = observer(function EnergyStepEditableBlock() {
  const { currentJurisdiction, error } = useJurisdiction()

  return error ? (
    <ErrorScreen error={error} />
  ) : (
    <Suspense fallback={<LoadingScreen />}>
      {/* TODO: Upgrade form */}
      {/* {currentJurisdiction && <Form jurisdiction={currentJurisdiction} />} */}
    </Suspense>
  )
})

// const Form = function JursidictionEnergyStepRequirementsForm({ jurisdiction }) {
//   const { energyStepRequired, zeroCarbonStepRequired, update } = jurisdiction

//   const { handleSubmit, control, formState } = useForm({
//     defaultValues: { energyStepRequired, zeroCarbonStepRequired },
//   })

//   const { isSubmitting } = formState
//   const [isEditing, setIsEditing] = useState(false)

//   const onSubmit = async (values) => {
//     const result = await update(values)
//     result && setIsEditing(false)
//   }

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} style={{ width: "100%" }}>
//       <EditableBlockContainer>
//         <EditableBlockHeading>{t(`${i18nPrefix}.part9Building`)}</EditableBlockHeading>
//         <Flex gap={6}>
//           <FormControl w="max-content">
//             <FormLabel>{t(`${i18nPrefix}.stepRequired.energy.title`)}</FormLabel>
//             <Controller
//               control={control}
//               name="energyStepRequired"
//               render={({ field: { onChange, value } }) => {
//                 return <EnergyStepSelect onChange={onChange} value={value} isDisabled={!isEditing} />
//               }}
//             />
//           </FormControl>
//           <FormControl w="max-content">
//             <FormLabel>{t(`${i18nPrefix}.stepRequired.zeroCarbon.title`)}</FormLabel>
//             <Controller
//               control={control}
//               name="zeroCarbonStepRequired"
//               render={({ field: { onChange, value } }) => {
//                 return <ZeroCarbonStepSelect onChange={onChange} value={value} isDisabled={!isEditing} />
//               }}
//             />
//           </FormControl>
//         </Flex>
//         {isEditing ? (
//           <HStack alignSelf="end">
//             <Button variant="primary" type="submit" isLoading={isSubmitting} isDisabled={isSubmitting}>
//               {t("ui.save")}
//             </Button>
//             <Button variant="secondary" onClick={() => setIsEditing(false)} isDisabled={isSubmitting}>
//               {t("ui.cancel")}
//             </Button>
//           </HStack>
//         ) : (
//           <Button alignSelf="end" variant="primary" leftIcon={<Pencil />} onClick={() => setIsEditing(true)}>
//             {t("ui.edit")}
//           </Button>
//         )}
//       </EditableBlockContainer>
//     </form>
//   )
// }
