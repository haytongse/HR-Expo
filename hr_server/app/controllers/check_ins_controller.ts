import CheckIn from '#models/check_in'
import Campus from '#models/campus'
import PublicHoliday from '#models/public_holiday'
import UserPermission from '#models/user_permission'
import UserShiftSchedule from '#models/user_shift_schedule'
import ShiftSchedule from '#models/shift_schedule'
import TimeTable from '#models/time_table'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

const toRad = (n: number) => (n * Math.PI) / 180

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default class CheckInsController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = request.input('page', 1)
    const year = request.input('year')
    const month = request.input('month')

    const query = CheckIn.query()
      .where('user_id', user.id)
      .orderBy('year', 'desc')
      .orderBy('month', 'desc')
      .orderBy('day', 'desc')
      .orderBy('time', 'asc')

    if (year) query.where('year', Number(year))
    if (month) query.where('month', Number(month))

    // When filtering by a specific month, return all records (no pagination)
    if (year && month) {
      const checkIns = await query
      return response.ok({ data: checkIns })
    }

    const checkIns = await query.paginate(page, 100)
    return response.ok(checkIns)
  }

  async today({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const now = DateTime.now().setZone('Asia/Phnom_Penh')

    const checkIns = await CheckIn.query()
      .where('user_id', user.id)
      .where('year', now.year)
      .where('month', now.month)
      .where('day', now.day)
      .orderBy('created_at', 'asc')

    const data = checkIns.map((ci) => ({
      ...ci.serialize(),
      createdAt: ci.createdAt.setZone('Asia/Phnom_Penh').toISO(),
      updatedAt: ci.updatedAt ? ci.updatedAt.setZone('Asia/Phnom_Penh').toISO() : null,
    }))

    return response.ok(data)
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const raw = request.only([
      'campus_code',
      'latitude',
      'longitude',
      'address',
      'street',
      'village',
      'district',
      'country',
    ])
    const campusCode = String(raw.campus_code ?? '')
    const latitude = Number(raw.latitude)
    const longitude = Number(raw.longitude)
    const address = raw.address ? String(raw.address) : null
    const street = raw.street ? String(raw.street) : null
    const village = raw.village ? String(raw.village) : null
    const district = raw.district ? String(raw.district) : null
    const country = raw.country ? String(raw.country) : null

    // Find campus
    const campus = await Campus.findBy('code', campusCode)
    if (!campus) return response.notFound({ message: 'Campus not found' })

    // Campus ownership check — compare campus code vs user's assigned campus code
    if (user.campusId) {
      const userCampus = await Campus.find(Number(user.campusId))
      if (userCampus && campus.code !== userCampus.code) {
        return response.forbidden({
          message: `This QR code is not for your campus. You are assigned to ${userCampus.fullName} (${userCampus.code}).`,
        })
      }
    }

    // Distance check: skip for noCheckOut or allowOutside users — they can check in from anywhere
    if (!user.noCheckOut && !(user as any).allowOutside && campus.lat && campus.long && campus.allowMeter) {
      const distance = haversineMeters(latitude, longitude, Number(campus.lat), Number(campus.long))
      if (distance > Number(campus.allowMeter)) {
        return response.badRequest({
          message: `You are ${Math.round(distance)}m away. Allowed: ${campus.allowMeter}m`,
        })
      }
    }

    const now = DateTime.now().setZone('Asia/Phnom_Penh')
    const dow = now.weekday % 7 // 0=Sun,1=Mon,...,6=Sat

    // Load today's scans (used for max-scan check and per-entry window counting)
    const todayScans = await CheckIn.query()
      .where('user_id', Number(user.id))
      .where('year', now.year)
      .where('month', now.month)
      .where('day', now.day)
      .select(['scan_type', 'time'])
    const count = todayScans.length

    // ── Load shift schedule ──────────────────────────────────────────────────
    let shiftId: number | null = null
    let shiftPeriod: string | null = null
    let allowTimeBefore = 0
    let allowTimeAfter = 0
    let allowAmountScan: number | null = null

    const userShift = await UserShiftSchedule.query()
      .where('user_id', Number(user.id))
      .orderBy('created_at', 'desc')
      .first()

    let timetableEntries: TimeTable[] = []

    if (userShift?.shiftScheduleId) {
      shiftId = Number(userShift.shiftScheduleId)
      const shift = await ShiftSchedule.find(shiftId)
      if (shift) {
        allowTimeBefore = Number(shift.allowTimeBefore ?? 0)
        allowTimeAfter = Number(shift.allowTimeAfter ?? 0)
        allowAmountScan = shift.allowAmountScan ? Number(shift.allowAmountScan) : null
      }
      timetableEntries = await TimeTable.query()
        .where('shift_schedule_id', shiftId)
        .where('day_of_week', dow)
        .orderBy('start_time', 'asc')
    }

    // ── Enforce max scans per day ────────────────────────────────────────────
    if (allowAmountScan !== null && count >= allowAmountScan) {
      return response.badRequest({
        message: `You have reached the maximum of ${allowAmountScan} scans for today.`,
      })
    }

    // ── Determine scan type by active time window (per timetable entry) ──────
    // Each entry is independent: missed morning → afternoon resets to scan 1 & 2
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number)
      return h * 60 + m
    }
    const fmtMin = (min: number) =>
      `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
    const nowMin = now.hour * 60 + now.minute

    let scanType: 'check_in' | 'check_out' = 'check_in'

    if (timetableEntries.length > 0) {
      let matched = false

      for (const entry of timetableEntries) {
        if (!entry.startTime) continue
        const ciTarget = toMin(entry.startTime)
        const coTarget = entry.endTime ? toMin(entry.endTime) : null
        const ciEarliest = ciTarget - allowTimeBefore
        const ciLatest = ciTarget + allowTimeAfter
        const coEarliest = coTarget !== null ? coTarget - allowTimeBefore : null
        const coLatest = coTarget !== null ? coTarget + allowTimeAfter : null

        const inCiWindow = nowMin >= ciEarliest && nowMin <= ciLatest
        const inCoWindow =
          coEarliest !== null && coLatest !== null && nowMin >= coEarliest && nowMin <= coLatest

        // If user has no_check_out, treat CO window as part of CI window
        const effectivelyInWindow = (user as any).noCheckOut
          ? inCiWindow || inCoWindow
          : inCiWindow || inCoWindow

        if (!effectivelyInWindow) continue

        matched = true
        shiftPeriod = entry.label ? entry.label.slice(0, 100) : null

        const spanStart = ciEarliest
        const spanEnd = coLatest ?? ciLatest
        const entryScans = todayScans.filter((r: any) => {
          if (!r.time) return false
          const m = toMin(r.time)
          return m >= spanStart && m <= spanEnd
        })
        const hasCI = entryScans.some((r: any) => r.scanType === 'check_in')
        const hasCO = entryScans.some((r: any) => r.scanType === 'check_out')

        if ((user as any).noCheckOut) {
          // No check-out required — only one check_in per session
          if (hasCI)
            return response.badRequest({ message: 'You have already checked in for this session.' })
          scanType = 'check_in'
        } else if (inCiWindow) {
          if (hasCI)
            return response.badRequest({ message: 'You have already checked in for this session.' })
          scanType = 'check_in'
        } else {
          if (hasCO)
            return response.badRequest({
              message: 'You have already checked out for this session.',
            })
          scanType = 'check_out'
        }
        break
      }

      if (!matched) {
        // Find the next upcoming window (CI or CO) across all entries
        let nextAt: string | null = null
        for (const entry of timetableEntries) {
          const spanStart = entry.startTime ? toMin(entry.startTime) - allowTimeBefore : null
          const spanEnd = entry.endTime ? toMin(entry.endTime) + allowTimeAfter : null
          const entryScans =
            spanStart !== null && spanEnd !== null
              ? todayScans.filter((r: any) => {
                  if (!r.time) return false
                  const m = toMin(r.time)
                  return m >= spanStart! && m <= spanEnd!
                })
              : []
          const hasCI = entryScans.some((r: any) => r.scanType === 'check_in')
          const hasCO = entryScans.some((r: any) => r.scanType === 'check_out')
          const ciEarliest = entry.startTime ? toMin(entry.startTime) - allowTimeBefore : null
          const coEarliest = entry.endTime ? toMin(entry.endTime) - allowTimeBefore : null
          if (!hasCI && ciEarliest !== null && ciEarliest > nowMin) {
            nextAt = fmtMin(ciEarliest)
            break
          }
          if (hasCI && !hasCO && coEarliest !== null && coEarliest > nowMin) {
            nextAt = fmtMin(coEarliest)
            break
          }
        }
        return response.badRequest({
          message: nextAt
            ? `Outside scan window. Next window opens at ${nextAt}.`
            : 'Outside scan window.',
        })
      }
    }

    // Build full address string
    const parts = [street, village, district, country].filter(Boolean)
    const fullAddress = address || (parts.length ? parts.join(', ') : null)

    const checkIn = await CheckIn.create({
      userId: Number(user.id),
      latitude,
      longitude,
      address: fullAddress,
      street,
      village,
      district,
      country,
      scanType,
      shiftPeriod,
      shiftId,
      year: now.year,
      month: now.month,
      day: now.day,
      time: now.toFormat('HH:mm:ss'),
      dayOfWeek: now.weekday % 7,
    })

    return response.created(checkIn)
  }

  async monthlySummary({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const now = DateTime.now().setZone('Asia/Phnom_Penh')
    const year = Number(request.input('year', now.year))
    const month = Number(request.input('month', now.month))

    const start = DateTime.fromObject({ year, month, day: 1 }, { zone: 'Asia/Phnom_Penh' })
    const end = start.endOf('month')

    const startIso = start.toISODate()! // "2025-04-01"
    const endIso = end.toISODate()! // "2025-04-30"

    // Fetch holidays whose start date falls within this month OR whose span reaches into it.
    // Query by date range (more reliable than year+month columns).
    const prevMonthStart = start.minus({ days: 10 }).toISODate()!
    const allHolidays = await PublicHoliday.query()
      .where('date', '>=', prevMonthStart)
      .where('date', '<=', endIso)

    // Build a set of holiday date strings that actually fall within this month
    const holidaySet = new Set<string>()
    const monthHolidays: typeof allHolidays = []

    for (const h of allHolidays) {
      const hDate = DateTime.fromISO(h.date).setZone('Asia/Phnom_Penh')
      let hitsThisMonth = false
      for (let i = 0; i < h.amountDay; i++) {
        const d = hDate.plus({ days: i })
        const iso = d.toISODate()!
        if (iso >= startIso && iso <= endIso) {
          holidaySet.add(iso)
          hitsThisMonth = true
        }
      }
      if (hitsThisMonth) monthHolidays.push(h)
    }

    // Get user's scheduled days of week from their timetable
    let workDaySet: Set<number> | null = null
    const userShiftForSummary = await UserShiftSchedule.query()
      .where('user_id', Number(user.id))
      .orderBy('created_at', 'desc')
      .first()
    if (userShiftForSummary?.shiftScheduleId) {
      const timetableRows = await TimeTable.query()
        .where('shift_schedule_id', Number(userShiftForSummary.shiftScheduleId))
        .select('day_of_week')
      const uniqueDows = [...new Set(timetableRows.map((t) => t.dayOfWeek))]
      if (uniqueDows.length > 0) workDaySet = new Set(uniqueDows)
    }

    // Count total working days in month (from timetable, or Mon–Sat fallback, excluding public holidays)
    let workingDays = 0
    let cursor = start
    while (cursor <= end) {
      const dow = cursor.weekday % 7 // 0=Sun, 1=Mon...6=Sat (matches timetable dayOfWeek)
      const isWorkDay = workDaySet ? workDaySet.has(dow) : cursor.weekday !== 7
      if (isWorkDay && !holidaySet.has(cursor.toISODate()!)) workingDays++
      cursor = cursor.plus({ days: 1 })
    }

    // Distinct days this user had a check_in scan
    const rows = await CheckIn.query()
      .where('user_id', Number(user.id))
      .where('year', year)
      .where('month', month)
      .where('scan_type', 'check_in')
      .select('day')
      .distinct('day')
    const attendedDays = rows.length

    // ── Leave balance: total public holiday days vs approved permission days ──
    // Total public holiday days for the year (sum of amount_day across all holidays)
    const yearHolidays = await PublicHoliday.query().where('year', year)
    const totalHolidayDays = yearHolidays.reduce((sum, h) => sum + Number(h.amountDay), 0)

    // Approved permission days used by this user this year
    const approvedPerms = await UserPermission.query()
      .where('user_id', Number(user.id))
      .where('status', 'approved')
      .whereRaw('YEAR(start_date) = ?', [year])
    const usedPermissionDays = approvedPerms.reduce((sum, p) => sum + Number(p.amountDay), 0)

    // Pending permission days (submitted but not yet decided)
    const pendingPerms = await UserPermission.query()
      .where('user_id', Number(user.id))
      .where('status', 'pending')
      .whereRaw('YEAR(start_date) = ?', [year])
    const pendingPermissionDays = pendingPerms.reduce((sum, p) => sum + Number(p.amountDay), 0)

    const remainingDays = Math.max(0, totalHolidayDays - usedPermissionDays)

    return response.ok({
      year,
      month,
      workingDays,
      attendedDays,
      publicHolidaysCount: monthHolidays.length,
      holidays: monthHolidays.map((h) => ({ name: h.name, date: h.date, amountDay: h.amountDay })),
      leaveBalance: {
        totalHolidayDays,
        usedPermissionDays,
        pendingPermissionDays,
        remainingDays,
      },
    })
  }
}
