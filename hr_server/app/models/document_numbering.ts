import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class DocumentNumbering extends BaseModel {
  static table = 'document_numbering'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare label: string

  @column()
  declare prefix: string

  @column()
  declare separator: string

  @column()
  declare padding: number

  @column()
  declare nextNumber: number

  @column()
  declare campusId: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
