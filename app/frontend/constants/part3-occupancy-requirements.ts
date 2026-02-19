export interface IPart3Occupancy {
  key: string
  name: string
  group: string
  division: number | null
  classificationDescription: string
  allowedEnergySteps: number[]
  allowedZeroCarbonLevels: number[]
  provincialBaseline: { energyStep: number; zeroCarbonLevel: number | null }
  bcbcTable: string | null
  isConfigurable: boolean
}

export interface IPart3OccupancyGroup {
  group: string
  division: number | null
  classificationDescription: string
  occupancies: IPart3Occupancy[]
}

/**
 * Canonical reference table of Part 3 occupancies with Energy Step Code
 * and Zero Carbon Step Code requirements, derived from the BC Building Code
 * (BCBC 2024, Tables 10.2.3.3.-A through 10.2.3.3.-J and Table 10.3.1.3).
 *
 * Step 1 is reserved for future use and is never selectable.
 * Provincial baselines represent the minimum acceptable standard.
 * Zero Carbon EL-1 is "measure only" (provincial minimum as of March 10, 2025).
 */
export const PART3_OCCUPANCIES: IPart3Occupancy[] = [
  // Group A, Division 2: Assembly occupancies
  {
    key: "schools_other_than_colleges",
    name: "Schools other than colleges",
    group: "A",
    division: 2,
    classificationDescription: "Assembly occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },
  {
    key: "libraries",
    name: "Libraries",
    group: "A",
    division: 2,
    classificationDescription: "Assembly occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },
  {
    key: "colleges",
    name: "Colleges",
    group: "A",
    division: 2,
    classificationDescription: "Assembly occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },
  {
    key: "recreation_centres",
    name: "Recreation centres",
    group: "A",
    division: 2,
    classificationDescription: "Assembly occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },

  // Group B, Division 2: Treatment occupancies
  {
    key: "hospitals",
    name: "Hospitals",
    group: "B",
    division: 2,
    classificationDescription: "Treatment occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },
  {
    key: "care_centres",
    name: "Care centres",
    group: "B",
    division: 2,
    classificationDescription: "Treatment occupancies",
    allowedEnergySteps: [2],
    allowedZeroCarbonLevels: [],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: null },
    bcbcTable: null,
    isConfigurable: false,
  },

  // Group C: Residential occupancies
  {
    key: "hotels_and_motels",
    name: "Hotels and motels",
    group: "C",
    division: null,
    classificationDescription: "Residential occupancies",
    allowedEnergySteps: [2, 3, 4],
    allowedZeroCarbonLevels: [1, 2, 3, 4],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: 1 },
    bcbcTable: "10.2.3.3.-G",
    isConfigurable: true,
  },
  {
    key: "other_residential_occupancies",
    name: "Other residential occupancies",
    group: "C",
    division: null,
    classificationDescription: "Residential occupancies",
    allowedEnergySteps: [2, 3, 4],
    allowedZeroCarbonLevels: [1, 2, 3, 4],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: 1 },
    bcbcTable: "10.2.3.3.-H",
    isConfigurable: true,
  },

  // Group D: Business and personal services occupancies
  {
    key: "offices",
    name: "Offices",
    group: "D",
    division: null,
    classificationDescription: "Business and personal services occupancies",
    allowedEnergySteps: [2, 3],
    allowedZeroCarbonLevels: [1, 2, 3, 4],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: 1 },
    bcbcTable: "10.2.3.3.-I",
    isConfigurable: true,
  },
  {
    key: "other_personal_services",
    name: "Other personal services",
    group: "D",
    division: null,
    classificationDescription: "Business and personal services occupancies",
    allowedEnergySteps: [2, 3],
    allowedZeroCarbonLevels: [1, 2, 3, 4],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: 1 },
    bcbcTable: "10.2.3.3.-J",
    isConfigurable: true,
  },

  // Group E: Mercantile occupancies
  {
    key: "mercantile_occupancies",
    name: "Mercantile occupancies",
    group: "E",
    division: null,
    classificationDescription: "Mercantile occupancies",
    allowedEnergySteps: [2, 3],
    allowedZeroCarbonLevels: [1, 2, 3, 4],
    provincialBaseline: { energyStep: 2, zeroCarbonLevel: 1 },
    bcbcTable: "10.2.3.3.-J",
    isConfigurable: true,
  },
]

/**
 * Occupancies grouped by Group + Division for display in the admin UI.
 * The order matches the BCBC Table 3.1.2.1 Major Occupancy Classification.
 */
export const PART3_OCCUPANCY_GROUPS: IPart3OccupancyGroup[] = (() => {
  const groups: IPart3OccupancyGroup[] = []
  const seen = new Map<string, IPart3OccupancyGroup>()

  for (const occ of PART3_OCCUPANCIES) {
    const groupKey = `${occ.group}-${occ.division ?? "none"}`
    let group = seen.get(groupKey)
    if (!group) {
      group = {
        group: occ.group,
        division: occ.division,
        classificationDescription: occ.classificationDescription,
        occupancies: [],
      }
      seen.set(groupKey, group)
      groups.push(group)
    }
    group.occupancies.push(occ)
  }

  return groups
})()

export function getPart3OccupancyByKey(key: string): IPart3Occupancy | undefined {
  return PART3_OCCUPANCIES.find((o) => o.key === key)
}
