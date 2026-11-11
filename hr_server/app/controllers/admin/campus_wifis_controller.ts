import Campus from '#models/campus'
import CampusWifi from '#models/campus_wifi'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminCampusWifisController {
  async index({ params, response }: HttpContext) {
    const campus = await Campus.findOrFail(Number(params.campusId))
    const wifis = await CampusWifi.query().where('campus_id', campus.id).orderBy('created_at', 'asc')
    return response.ok({ data: wifis.map((w) => ({ id: w.id, campusId: w.campusId, wifiName: w.wifiName, createdAt: w.createdAt })) })
  }

  async store({ params, request, response }: HttpContext) {
    const campus = await Campus.findOrFail(Number(params.campusId))
    const wifiName = String(request.input('wifiName', '') || request.input('wifi_name', '')).trim()
    if (!wifiName) {
      return response.badRequest({ message: 'WiFi name is required' })
    }
    const existing = await CampusWifi.query()
      .where('campus_id', campus.id)
      .whereRaw('LOWER(wifi_name) = ?', [wifiName.toLowerCase()])
      .first()
    if (existing) {
      return response.conflict({ message: 'This WiFi name already exists for this campus' })
    }
    const wifi = await CampusWifi.create({ campusId: campus.id, wifiName })
    return response.created({ data: { id: wifi.id, campusId: wifi.campusId, wifiName: wifi.wifiName, createdAt: wifi.createdAt } })
  }

  async destroy({ params, response }: HttpContext) {
    const wifi = await CampusWifi.query()
      .where('id', Number(params.id))
      .where('campus_id', Number(params.campusId))
      .firstOrFail()
    await wifi.delete()
    return response.noContent()
  }
}
