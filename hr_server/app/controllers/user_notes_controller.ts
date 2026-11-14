import UserNote from '#models/user_note'
import type { HttpContext } from '@adonisjs/core/http'
import { join } from 'node:path'
import { writeFile, mkdir, unlink } from 'node:fs/promises'

export default class UserNotesController {
  async index({ auth, request, response }: HttpContext) {
    const user  = auth.getUserOrFail()
    const year  = request.input('year')
    const month = request.input('month')
    const date  = request.input('date')

    const query = UserNote.query()
      .where('user_id', Number(user.id))
      .orderBy('created_at', 'asc')

    if (date) {
      query.where('date', String(date))
    } else if (year && month) {
      const y  = String(year)
      const m  = String(month).padStart(2, '0')
      query.where('date', '>=', `${y}-${m}-01`).where('date', '<=', `${y}-${m}-31`)
    }

    const notes = await query
    return response.ok({ data: notes })
  }

  async store({ auth, request, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const { date, title, body, photo_base64 } = request.only(['date', 'title', 'body', 'photo_base64'])

    if (!date || !body) return response.badRequest({ message: 'date and body are required' })

    let photoPath: string | null = null
    if (photo_base64) {
      const dir      = join(process.cwd(), 'public', 'notes')
      await mkdir(dir, { recursive: true })
      const filename = `${user.id}_${Date.now()}.jpg`
      const buffer   = Buffer.from(String(photo_base64).replace(/^data:image\/\w+;base64,/, ''), 'base64')
      await writeFile(join(dir, filename), buffer)
      photoPath = `/notes/${filename}`
    }

    const note = await UserNote.create({
      userId:    Number(user.id),
      date:      String(date),
      title:     title ? String(title) : null,
      body:      String(body),
      photoPath,
    })
    return response.created(note)
  }

  async update({ auth, request, response, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await UserNote.query()
      .where('id', Number(params.id))
      .where('user_id', Number(user.id))
      .firstOrFail()

    const { title, body, photo_base64 } = request.only(['title', 'body', 'photo_base64'])

    if (title !== undefined) note.title = title ? String(title) : null
    if (body)                note.body  = String(body)

    if (photo_base64) {
      if (note.photoPath) {
        try { await unlink(join(process.cwd(), 'public', note.photoPath)) } catch {}
      }
      const dir      = join(process.cwd(), 'public', 'notes')
      await mkdir(dir, { recursive: true })
      const filename = `${user.id}_${Date.now()}.jpg`
      const buffer   = Buffer.from(String(photo_base64).replace(/^data:image\/\w+;base64,/, ''), 'base64')
      await writeFile(join(dir, filename), buffer)
      note.photoPath = `/notes/${filename}`
    }

    await note.save()
    return response.ok(note)
  }

  async destroy({ auth, response, params }: HttpContext) {
    const user = auth.getUserOrFail()
    const note = await UserNote.query()
      .where('id', Number(params.id))
      .where('user_id', Number(user.id))
      .firstOrFail()

    if (note.photoPath) {
      try { await unlink(join(process.cwd(), 'public', note.photoPath)) } catch {}
    }
    await note.delete()
    return response.ok({ message: 'Note deleted' })
  }
}
