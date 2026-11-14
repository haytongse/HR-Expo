import DocumentNumbering from '#models/document_numbering'
import type { HttpContext } from '@adonisjs/core/http'

export default class DocumentNumberingController {
  async index({ auth, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = DocumentNumbering.query().orderBy('created_at', 'asc')
    if (campusId !== null) query.where('campus_id', campusId)
    const configs = await query
    return response.ok({ data: configs })
  }

  async upsert({ auth, params, request, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ? Number(admin.campusId) : null
    const { label, prefix, separator, padding, nextNumber } = request.only([
      'label', 'prefix', 'separator', 'padding', 'nextNumber',
    ])
    const cfg = await DocumentNumbering.updateOrCreate(
      { id: params.id },
      { label, prefix, separator: separator ?? '', padding: Number(padding) || 3, nextNumber: Number(nextNumber) || 1, campusId }
    )
    return response.ok({ data: cfg })
  }

  async destroy({ params, response }: HttpContext) {
    const cfg = await DocumentNumbering.findOrFail(params.id)
    await cfg.delete()
    return response.ok({ message: 'Deleted' })
  }

  async preview({ auth, params, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = DocumentNumbering.query().where('id', params.id)
    if (campusId !== null) query.where('campus_id', campusId)
    const cfg = await query.firstOrFail()
    const code = `${cfg.prefix}${cfg.separator}${String(cfg.nextNumber).padStart(cfg.padding, '0')}`
    return response.ok({ data: code })
  }

  async consume({ auth, params, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = DocumentNumbering.query().where('id', params.id)
    if (campusId !== null) query.where('campus_id', campusId)
    const cfg = await query.firstOrFail()
    const code = `${cfg.prefix}${cfg.separator}${String(cfg.nextNumber).padStart(cfg.padding, '0')}`
    cfg.nextNumber += 1
    await cfg.save()
    return response.ok({ data: code })
  }

  async undo({ auth, params, response }: HttpContext) {
    const admin = auth.getUserOrFail()
    const campusId = admin.campusId ?? null
    const query = DocumentNumbering.query().where('id', params.id)
    if (campusId !== null) query.where('campus_id', campusId)
    const cfg = await query.firstOrFail()
    if (cfg.nextNumber > 1) {
      cfg.nextNumber -= 1
      await cfg.save()
    }
    return response.ok({ data: cfg })
  }
}
