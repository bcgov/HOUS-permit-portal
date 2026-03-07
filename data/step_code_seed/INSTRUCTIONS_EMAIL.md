# Step Code Requirements & Climate Zones — Data Collection Instructions

Hi,

We need to collect Step Code configuration data for each jurisdiction.

**The easiest way to do this** is to request an invite to the BC Building Permit Hub and use our interactive configuration tool directly. The tool walks you through selecting your climate zones, setting HDD values, and configuring your step code requirements — no spreadsheets required. If you'd like an invite, just let us know and we'll get you set up.

If you'd prefer to provide the data via CSV instead, we've attached **two files** for your jurisdiction. Please fill them out and return them.

---

## File Naming

Each file must be named using your jurisdiction's **slug** — a lowercase, hyphenated identifier. The import process relies on the filename to match data to the correct jurisdiction.

**To find your jurisdiction's slug:**

1. Go to [https://buildingpermit.gov.bc.ca/jurisdictions](https://buildingpermit.gov.bc.ca/jurisdictions?currentPage=1)
2. Find your jurisdiction in the list
3. Click on it — the URL will change to something like `https://buildingpermit.gov.bc.ca/jurisdictions/city-of-mission`
4. The last part of the URL (e.g. `city-of-mission`) is your slug

**Name your files using that slug:**

- `city-of-mission-step-requirements.csv`
- `city-of-mission-climate-zones.csv`

More generally:

- `<your-slug>-step-requirements.csv` — Energy Step & Zero Carbon requirements
- `<your-slug>-climate-zones.csv` — Climate zones & Heating Degree Days

---

## File 1: Step Requirements (`<slug>-step-requirements.csv`)

This file has two sections separated by a blank row:

### Section: Part 9

This row defines the Energy Step and Zero Carbon Step requirements for small-scale residential buildings (Part 9 BCBC).

| Column                        | What to enter              |
| ----------------------------- | -------------------------- |
| **Energy Step Required**      | An integer between 3 and 5 |
| **Zero Carbon Step Required** | An integer between 1 and 4 |

Fill in both values. The first row sets the default requirement.

**Multiple compliance pathways:** If your jurisdiction offers more than one compliance pathway, **duplicate the row** and enter different values on each row. The first row will be the default; additional rows become alternative pathways.

### Section: Part 3

These rows are for configurable Part 3 occupancies where your jurisdiction can set requirements above the provincial baseline. (Non-configurable occupancies like Schools, Libraries, Colleges, Recreation centres, Hospitals, and Care centres are not included — they always use the provincial baseline of Energy Step 2.)

| Column                        | What to enter                                                                                 |
| ----------------------------- | --------------------------------------------------------------------------------------------- |
| **Energy Step Required**      | An integer within the allowed range shown in the Notes column                                 |
| **Zero Carbon Step Required** | An integer within the allowed range shown in the Notes column (leave blank if not applicable) |

**Multiple compliance pathways:** If your jurisdiction offers more than one compliance pathway for the same occupancy type (e.g., hotels can meet either Energy Step 3 or Energy Step 4), **duplicate the row** and enter different values on each row. The Key and Name columns must match exactly.

**If you have no requirements** for a configurable occupancy, leave the Energy Step and Zero Carbon Step columns blank. The provincial baseline will apply automatically.

---

## File 2: Climate Zones (`<slug>-climate-zones.csv`)

This file lists all six BC Climate Zones. Fill it out as follows:

1. **Delete rows** for any climate zones that do **not** apply to your jurisdiction.
2. For zones that do apply, optionally enter a **Heating Degree Days** value in the second column. This is the HDD value that applicants must use in their energy modelling calculations. If left blank, applicants may use any appropriate HDD value for that zone.

| Column                             | What to enter                                   |
| ---------------------------------- | ----------------------------------------------- |
| **Climate Zone**                   | Do not edit — this is the zone identifier       |
| **Heating Degree Days (optional)** | A positive integer up to 10,000, or leave blank |
| **Zone Label**                     | Reference only — do not edit                    |

---

## Example

For a jurisdiction in Climate Zone 5 with an HDD of 3200, the climate zones CSV would look like:

```
Climate Zone,Heating Degree Days (optional),Zone Label (reference - do not edit)
zone_5,3200,Zone 5
```

(All other zone rows deleted because they don't apply.)

---

## Important Notes

- **Do not rename the files.** The slug in the filename identifies your jurisdiction.
- **Do not edit** the Key, Name, or Notes columns in the step requirements file.
- **Do not edit** the Climate Zone or Zone Label columns in the climate zones file.
- Leave rows blank (no Energy Step / Zero Carbon values) if a particular occupancy or permit type should use the provincial defaults.
- For Part 3 occupancies, you may add duplicate rows for multiple compliance pathways.
- For climate zones, delete rows for zones that don't apply to your jurisdiction.

Please return the completed files at your earliest convenience. If you have any questions, don't hesitate to reach out.

Thanks!
