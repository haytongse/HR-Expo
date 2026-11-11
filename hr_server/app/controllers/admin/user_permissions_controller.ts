import UserPermission from '#models/user_permission'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import { sendPushNotification } from '#services/notification_service'

export default class AdminUserPermissionsController {
  async index({ request, response }: HttpContext) {
    const qs = request.qs()
    const user_id = Array.isArray(qs.user_id) ? qs.user_id[0] : qs.user_id
    const status = Array.isArray(qs.status) ? qs.status[0] : qs.status
    const page = Number(Array.isArray(qs.page) ? qs.page[0] : (qs.page ?? 1)) || 1

    const query = UserPermission.query()
      .preload('user')
      .preload('approver')
      .preload('photos')
      .orderBy('created_at', 'desc')

    if (user_id) query.where('user_id', Number(user_id))
    if (status) query.where('status', String(status))

    const permissions = await query.paginate(page, 20)
    return response.ok(permissions)
  }

  async approve({ params, request, auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const permission = await UserPermission.find(Number(params.id))
    if (!permission) return response.notFound({ message: 'Permission not found' })

    const notes = request.input('notes', null)
    permission.status = 'approved'
    permission.approvedBy = Number(admin.id)
    if (notes) permission.notes = String(notes)
    await permission.save()

    // Notify the requesting user
    const user = await User.find(permission.userId)
    if (user?.fcmToken) {
      const typeLabel = permission.type === 'sick' ? 'Sick Leave' : permission.type === 'permission' ? 'Permission' : 'Leave'
      await sendPushNotification(
        user.fcmToken,
        'Request Approved ✓',
        `Your ${typeLabel} request has been approved.${notes ? ` Note: ${notes}` : ''}`,
        { type: 'permission_approved', permission_id: String(permission.id) }
      )
    }

    return response.ok({ data: permission })
  }

  async reject({ params, request, auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const permission = await UserPermission.find(Number(params.id))
    if (!permission) return response.notFound({ message: 'Permission not found' })

    const notes = request.input('notes', null)
    permission.status = 'rejected'
    permission.approvedBy = Number(admin.id)
    if (notes) permission.notes = String(notes)
    await permission.save()

    // Notify the requesting user
    const user = await User.find(permission.userId)
    if (user?.fcmToken) {
      const typeLabel = permission.type === 'sick' ? 'Sick Leave' : permission.type === 'permission' ? 'Permission' : 'Leave'
      await sendPushNotification(
        user.fcmToken,
        'Request Rejected',
        `Your ${typeLabel} request has been rejected.${notes ? ` Reason: ${notes}` : ''}`,
        { type: 'permission_rejected', permission_id: String(permission.id) }
      )
    }

    return response.ok({ data: permission })
  }

  async destroy({ params, response }: HttpContext) {
    const permission = await UserPermission.find(Number(params.id))
    if (!permission) return response.notFound({ message: 'Permission not found' })
    await permission.delete()
    return response.ok({ message: 'Deleted' })
  }
}
