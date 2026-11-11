import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class PublicHoliday extends BaseModel {
  static table = 'public_holidays'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare date: string

  @column()
  declare amountDay: number

  @column()
  declare description: string | null

  @column()
  declare year: number

  @column()
  declare month: number

  @column()
  declare day: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
