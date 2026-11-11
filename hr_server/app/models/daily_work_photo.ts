import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import DailyWork from '#models/daily_work'

export default class DailyWorkPhoto extends BaseModel {
  static table = 'daily_work_photos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare dailyWorkId: number

  @column()
  declare photoPath: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => DailyWork)
  declare dailyWork: BelongsTo<typeof DailyWork>
}
