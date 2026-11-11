import Campus from '#models/campus'
import type { HttpContext } from '@adonisjs/core/http'

export default class CampusesController {
  private serialize(c: Campus) {
    return {
      id: c.id,
      code: c.code,
      publicId: c.publicId,
      wifis: (c.wifis ?? []).map((w) => ({ id: w.id, wifiName: w.wifiName })),
      fullName: c.fullName,
      address: c.address,
      phoneNumber: c.phoneNumber,
      email: c.email,
      status: c.status,
      allowMeter: c.allowMeter,
      lat: c.lat,
      long: c.long,
    }
  }

  async index({ response }: HttpContext) {
    const campuses = await Campus.query().where('status', 1).preload('wifis')
    return response.ok(campuses.map((c) => this.serialize(c)))
  }

  async show({ params, response }: HttpContext) {
    const campus = await Campus.query()
      .where('code', params.code)
      .preload('wifis')
      .firstOrFail()
    return response.ok(this.serialize(campus))
  }
}
