import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Campus from '#models/campus'

export default class CampusWifi extends BaseModel {
  static table = 'campus_wifis'
  static readonly updatedAtColumn = null

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare campusId: number

  @column()
  declare wifiName: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Campus)
  declare campus: BelongsTo<typeof Campus>
}
