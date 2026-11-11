import Campus from '#models/campus'
import type { HttpContext } from '@adonisjs/core/http'

export default class AdminCampusesController {
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
      website: c.website,
      description: c.description,
      status: c.status,
      allowMeter: c.allowMeter,
      lat: c.lat,
      long: c.long,
    }
  }

  async index({ response }: HttpContext) {
    const campuses = await Campus.query().preload('wifis').orderBy('created_at', 'desc')
    return response.ok({ data: campuses.map((c) => this.serialize(c)) })
  }

  async store({ request, response }: HttpContext) {
    const d = request.only([
      'code',
      'publicId',
      'fullName',
      'address',
      'phoneNumber',
      'email',
      'website',
      'description',
      'status',
      'allowMeter',
      'lat',
      'long',
    ])
    const campus = await Campus.create({
      code: String(d.code ?? ''),
      publicId: d.publicId ? String(d.publicId) : null,
      fullName: String(d.fullName ?? ''),
      address: d.address ? String(d.address) : null,
      phoneNumber: d.phoneNumber ? String(d.phoneNumber) : null,
      email: d.email ? String(d.email) : null,
      website: d.website ? String(d.website) : null,
      description: d.description ? String(d.description) : null,
      status: Number(d.status ?? 1),
      startCounts: 0,
      allowMeter: d.allowMeter ? Number(d.allowMeter) : null,
      lat: d.lat ? Number(d.lat) : null,
      long: d.long ? Number(d.long) : null,
    })
    await campus.load('wifis')
    return response.created({ data: this.serialize(campus) })
  }

  async update({ params, request, response }: HttpContext) {
    const campus = await Campus.findOrFail(Number(params.id))
    const d = request.only([
      'code',
      'publicId',
      'fullName',
      'address',
      'phoneNumber',
      'email',
      'website',
      'description',
      'status',
      'allowMeter',
      'lat',
      'long',
    ])
    if (d.code !== undefined) campus.code = String(d.code)
    if (d.publicId !== undefined) campus.publicId = d.publicId ? String(d.publicId) : null
    if (d.fullName !== undefined) campus.fullName = String(d.fullName)
    if (d.address !== undefined) campus.address = d.address ? String(d.address) : null
    if (d.phoneNumber !== undefined)
      campus.phoneNumber = d.phoneNumber ? String(d.phoneNumber) : null
    if (d.email !== undefined) campus.email = d.email ? String(d.email) : null
    if (d.website !== undefined) campus.website = d.website ? String(d.website) : null
    if (d.description !== undefined)
      campus.description = d.description ? String(d.description) : null
    if (d.status !== undefined) campus.status = Number(d.status)
    if (d.allowMeter !== undefined) campus.allowMeter = d.allowMeter ? Number(d.allowMeter) : null
    if (d.lat !== undefined) campus.lat = d.lat ? Number(d.lat) : null
    if (d.long !== undefined) campus.long = d.long ? Number(d.long) : null
    await campus.save()
    await campus.load('wifis')
    return response.ok({ data: this.serialize(campus) })
  }

  async destroy({ params, response }: HttpContext) {
    const campus = await Campus.findOrFail(Number(params.id))
    await campus.delete()
    return response.noContent()
  }

  async importCampuses({ request, response }: HttpContext) {
    const rows: any[] = request.input('campuses', [])
    if (!Array.isArray(rows) || rows.length === 0) {
      return response.badRequest({ message: 'No campuses provided' })
    }

    let created = 0
    const errors: { row: number; message: string }[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        if (row.id) {
          const campus = await Campus.find(Number(row.id))
          if (!campus) { errors.push({ row: i + 1, message: `Campus id ${row.id} not found` }); continue }
          if (row.code) campus.code = String(row.code)
          if (row.fullName) campus.fullName = String(row.fullName)
          if (row.address !== undefined) campus.address = row.address || null
          if (row.phoneNumber !== undefined) campus.phoneNumber = row.phoneNumber || null
          if (row.email !== undefined) campus.email = row.email || null
          if (row.description !== undefined) campus.description = row.description || null
          if (row.allowMeter !== undefined) campus.allowMeter = row.allowMeter ? Number(row.allowMeter) : null
          if (row.lat !== undefined) campus.lat = row.lat ? Number(row.lat) : null
          if (row.long !== undefined) campus.long = row.long ? Number(row.long) : null
          if (row.status !== undefined) campus.status = Number(row.status ?? 1)
          if (row.publicId !== undefined) campus.publicId = row.publicId || null
          await campus.save()
          created++
        } else {
          if (!row.code || !row.fullName) { errors.push({ row: i + 1, message: 'Code and Full Name are required' }); continue }
          await Campus.create({
            code: String(row.code).toUpperCase(),
            fullName: String(row.fullName),
            address: row.address || null,
            phoneNumber: row.phoneNumber || null,
            email: row.email || null,
            description: row.description || null,
            status: Number(row.status ?? 1),
            startCounts: 0,
            allowMeter: row.allowMeter ? Number(row.allowMeter) : null,
            lat: row.lat ? Number(row.lat) : null,
            long: row.long ? Number(row.long) : null,
            publicId: row.publicId || null,
          })
          created++
        }
      } catch (e: any) {
        errors.push({ row: i + 1, message: e.message ?? 'Unknown error' })
      }
    }

    return response.ok({ created, errors })
  }
}
