export interface User {
  id: number
  userCode: string | null
  fullName: string | null
  email: string
  role: 'admin' | 'user'
  status: string
  campusId: number | null
  phoneNumber: string | null
  address: string | null
  birthOfDate: string | null
  profilePicture: string | null
  initials: string
  createdAt: string
  updatedAt: string
  shiftSchedule?: ShiftSchedule | null
  allowWifi?: boolean | null
  noCheckOut?: boolean | null
  allowOutside?: boolean | null
}

export interface CampusWifi {
  id: number
  wifiName: string
}

export interface Campus {
  id: number
  code: string
  publicId: string | null
  fullName: string
  address: string | null
  phoneNumber: string | null
  email: string | null
  website: string | null
  description?: string | null
  logo: string | null
  status: number
  allowMeter: number | null
  lat: number | null
  long: number | null
  wifis: CampusWifi[]
}

export interface CheckIn {
  id: number
  userId: number | null
  latitude: number | null
  longitude: number | null
  photoPath: string | null
  scanType: 'check_in' | 'check_out'
  shiftPeriod: string | null
  timeTableId: number | null
  year: number | null
  month: number | null
  day: number | null
  time: string | null
  dayOfWeek: number | null
  createdAt: string
}

export interface TimeTable {
  id: number
  shiftScheduleId: number | null
  dayOfWeek: number
  label: string
  startTime: string | null
  endTime: string | null
}

export interface ShiftSchedule {
  id: number
  name: string | null
  startDate: string
  endDate: string
  createdBy: number | null
  weeklyRules: object | null
  allowTimeBefore: number | null
  allowTimeAfter: number | null
  allowAmountScan: number | null
  allowTimeSecondScan: number | null
  createdAt: string
  updatedAt: string | null
}

export interface AttendanceSummary {
  totalUsers: number
  checkedIn: number
  notCheckedIn: number
}

export interface PublicHoliday {
  id: number
  name: string
  date: string
  amountDay: number
  description: string | null
  year: number
  month: number
  day: number
  createdAt: string
}

export interface PermissionPhoto {
  id: number
  permissionId: number
  photoPath: string
}

export interface UserPermission {
  id: number
  userId: number
  type: 'leave' | 'sick' | 'permission'
  startDate: string
  endDate: string
  amountDay: number
  reason: string | null
  photoPath: string | null
  status: 'pending' | 'approved' | 'rejected'
  approvedBy: number | null
  notes: string | null
  createdAt: string
  photos?: PermissionPhoto[]
  user?: { fullName: string | null; email: string }
  approver?: { fullName: string | null; email: string } | null
}
