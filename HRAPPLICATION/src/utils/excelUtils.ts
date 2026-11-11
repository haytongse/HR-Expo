import XLSX from 'xlsx'
import RNBlobUtil from 'react-native-blob-util'
import { Platform } from 'react-native'

// ─── Export ───────────────────────────────────────────────────────────────────

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

export async function exportToExcel(
  data: Record<string, any>[],
  fileName: string,
  sheetName: string = 'Sheet1',
): Promise<void> {
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' })

  const dir = RNBlobUtil.fs.dirs.DocumentDir
  const path = `${dir}/${fileName}.xlsx`

  await RNBlobUtil.fs.writeFile(path, wbout, 'base64')

  if (Platform.OS === 'ios') {
    await RNBlobUtil.ios.previewDocument(path)
  } else {
    await RNBlobUtil.android.actionViewIntent(path, XLSX_MIME)
  }
}

// ─── Import ───────────────────────────────────────────────────────────────────

export async function importFromExcel(filePath: string): Promise<Record<string, any>[]> {
  const content = await RNBlobUtil.fs.readFile(filePath, 'base64')
  const wb = XLSX.read(content, { type: 'base64' })
  const sheetName = wb.SheetNames[0]
  const ws = wb.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(ws)
}

// ─── Template helpers ─────────────────────────────────────────────────────────

export const CAMPUS_COLUMNS = ['Code', 'Full Name', 'Address', 'Phone Number', 'Email', 'Website', 'Description', 'Allow Meter (m)', 'Latitude', 'Longitude', 'Status (1=Active/0=Inactive)', 'Public ID']
export const USER_COLUMNS   = ['Full Name', 'Email', 'Password', 'Role (user/admin)', 'Phone Number', 'Address', 'Birth Date (YYYY-MM-DD)', 'Campus ID', 'User Code', 'Allow WiFi (true/false)', 'No Check Out (true/false)']

export function campusTemplate(): Record<string, any>[] {
  return [{
    'Code': 'HQ',
    'Full Name': 'Headquarters',
    'Address': '123 Main St',
    'Phone Number': '+855 23 000 000',
    'Email': 'hq@example.com',
    'Website': 'https://example.com',
    'Description': 'Main headquarters',
    'Allow Meter (m)': 100,
    'Latitude': 11.5564,
    'Longitude': 104.9282,
    'Status (1=Active/0=Inactive)': 1,
    'Public ID': '',
  }]
}

export function userTemplate(): Record<string, any>[] {
  return [{
    'Full Name': 'John Doe',
    'Email': 'john@example.com',
    'Password': 'Secret123',
    'Role (user/admin)': 'user',
    'Phone Number': '+855 12 000 000',
    'Address': '123 Main St',
    'Birth Date (YYYY-MM-DD)': '1990-01-15',
    'Campus ID': 1,
    'User Code': 'EMP001',
    'Allow WiFi (true/false)': false,
    'No Check Out (true/false)': false,
  }]
}
