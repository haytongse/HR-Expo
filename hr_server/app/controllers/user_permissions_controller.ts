import UserPermission from '#models/user_permission'
import PermissionPhoto from '#models/permission_photo'
import PublicHoliday from '#models/public_holiday'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import { sendPushNotifications } from '#services/notification_service'

/**
 * Count working days between start and end (inclusive).
 * Excludes Sundays and any public holidays in that range.
 */
async function countWorkDays(startDate: string, endDate: string): Promise<number> {
  const start = DateTime.fromISO(startDate).setZone('Asia/Phnom_Penh').startOf('day')
  const end = DateTime.fromISO(endDate).setZone('Asia/Phnom_Penh').startOf('day')

  if (!start.isValid || !end.isValid || end < start) return 0

  const holidays = await PublicHoliday.query()
    .where('year', '>=', start.year)
    .where('year', '<=', end.year)

  const holidaySet = new Set<string>()
  for (const h of holidays) {
    const hDate = DateTime.fromISO(h.date).setZone('Asia/Phnom_Penh')
    for (let i = 0; i < h.amountDay; i++) {
      holidaySet.add(hDate.plus({ days: i }).toISODate()!)
    }
  }

  let count = 0
  let cursor = start
  while (cursor <= end) {
    if (cursor.weekday !== 7 && !holidaySet.has(cursor.toISODate()!)) count++
    cursor = cursor.plus({ days: 1 })
  }
  return count
}

async function savePhotos(base64List: string[]): Promise<string[]> {
  const app = (await import('@adonisjs/core/services/app')).default
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const uploadDir = app.makePath('public/permissions')
  await fs.mkdir(uploadDir, { recursive: true })

  const paths: string[] = []
  for (const b64 of base64List) {
    try {
      const filename = `perm_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`
      const buf = Buffer.from(b64, 'base64')
      await fs.writeFile(path.join(uploadDir, filename), buf)
      paths.push(`/permissions/${filename}`)
    } catch (err) {
      console.error('[Permission.store] photo save error:', err)
    }
  }
  return paths
}

export default class UserPermissionsController {
  async index({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const page = Number(request.input('page', 1)) || 1

    const permissions = await UserPermission.query()
      .where('user_id', Number(user.id))
      .preload('approver')
      .preload('leaveType')
      .preload('photos')
      .orderBy('created_at', 'desc')
      .paginate(page, 20)

    return response.ok(permissions)
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const d = request.only([
      'type',
      'leave_type_id',
      'start_date',
      'end_date',
      'reason',
      'photos_base64',
    ])

    if (!d.start_date || !d.end_date) {
      return response.badRequest({ message: 'start_date and end_date are required' })
    }

    const start = DateTime.fromISO(String(d.start_date)).setZone('Asia/Phnom_Penh')
    const end = DateTime.fromISO(String(d.end_date)).setZone('Asia/Phnom_Penh')

    if (!start.isValid || !end.isValid) {
      return response.badRequest({ message: 'Invalid date format' })
    }
    if (end < start) {
      return response.badRequest({ message: 'end_date must be after start_date' })
    }

    const amountDay = await countWorkDays(start.toISODate()!, end.toISODate()!)

    // Resolve type from leave_type_id, or fallback to legacy type string
    let typeName = 'leave'
    let leaveTypeId: number | null = null
    if (d.leave_type_id) {
      const LeaveType = (await import('#models/leave_type')).default
      const lt = await LeaveType.find(Number(d.leave_type_id))
      if (lt) {
        typeName = lt.name
        leaveTypeId = lt.id
      }
    } else {
      const allowedTypes = ['leave', 'sick', 'permission']
      typeName = allowedTypes.includes(String(d.type)) ? String(d.type) : 'leave'
    }

    const permission = await UserPermission.create({
      userId: Number(user.id),
      type: typeName,
      leaveTypeId,
      startDate: start.toISODate()!,
      endDate: end.toISODate()!,
      amountDay,
      reason: d.reason ? String(d.reason) : null,
      status: 'pending',
    })

    // Save photos
    const base64List: string[] = Array.isArray(d.photos_base64) ? d.photos_base64 : []
    if (base64List.length > 0) {
      const photoPaths = await savePhotos(base64List)
      for (const photoPath of photoPaths) {
        await PermissionPhoto.create({ permissionId: permission.id, photoPath })
      }
    }

    await permission.load('photos')

    // Notify all admins about the new leave request
    const admins = await User.query().where('role', 'admin')
    const adminTokens = admins.map((a) => a.fcmToken).filter(Boolean) as string[]
    if (adminTokens.length) {
      const userName = user.fullName || user.email
      await sendPushNotifications(adminTokens, 'New Leave Request', `${userName} · ${typeName}`, {
        type: 'new_permission',
        permission_id: String(permission.id),
      })
    }

    return response.created({ data: permission })
  }

  async destroy({ auth, params, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const permission = await UserPermission.query()
      .where('id', Number(params.id))
      .where('user_id', Number(user.id))
      .first()

    if (!permission) return response.notFound({ message: 'Permission not found' })
    if (permission.status !== 'pending') {
      return response.badRequest({ message: 'Cannot cancel an already processed request' })
    }

    await permission.delete()

    // Notify all admins that the request was cancelled
    const admins = await User.query().where('role', 'admin')
    const adminTokens = admins.map((a) => a.fcmToken).filter(Boolean) as string[]
    if (adminTokens.length) {
      const userName = user.fullName || user.email
      await sendPushNotifications(adminTokens, 'Leave Request Cancelled', `${userName} · ${permission.type}`, {
        type: 'permission_cancelled',
        permission_id: String(params.id),
      })
    }

    return response.ok({ message: 'Cancelled' })
  }
}
