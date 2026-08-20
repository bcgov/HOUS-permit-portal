import { EClimateZone } from "../types/enums"

/** Upper-bound inclusive HDD → climate zone (mirrors StepCode::Part3::V0::Requirements::References::ClimateZone) */
const CLIMATE_ZONE_HDD_LOOKUP: ReadonlyArray<{ zone: EClimateZone; maxHdd: number }> = [
  { zone: EClimateZone.zone4, maxHdd: 2999 },
  { zone: EClimateZone.zone5, maxHdd: 3999 },
  { zone: EClimateZone.zone6, maxHdd: 4999 },
  { zone: EClimateZone.zone7a, maxHdd: 5999 },
  { zone: EClimateZone.zone7b, maxHdd: 6999 },
  { zone: EClimateZone.zone8, maxHdd: 8000 },
]

export function climateZoneFromHdd(hdd: number | null | undefined): EClimateZone | null {
  if (hdd === null || hdd === undefined || Number.isNaN(Number(hdd))) return null

  const value = Number(hdd)
  const match = CLIMATE_ZONE_HDD_LOOKUP.find(({ maxHdd }) => value <= maxHdd)
  return match?.zone ?? EClimateZone.zone8
}

export function climateZoneShortLabel(zone: EClimateZone | string | null | undefined): string {
  if (!zone) return ""
  const map: Record<string, string> = {
    [EClimateZone.zone4]: "4",
    [EClimateZone.zone5]: "5",
    [EClimateZone.zone6]: "6",
    [EClimateZone.zone7a]: "7A",
    [EClimateZone.zone7b]: "7B",
    [EClimateZone.zone8]: "8",
  }
  return map[zone] ?? String(zone)
}
