import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class UserNote extends BaseModel {
  static table = 'user_notes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare date: string

  @column()
  declare title: string | null

  @column()
  declare body: string

  @column()
  declare photoPath: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
