import { BaseModel, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class TimeTable extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'shift_schedule_id' })
  declare shiftScheduleId: number | null

  @column({ columnName: 'day_of_week' })
  declare dayOfWeek: number

  @column()
  declare label: string

  @column()
  declare startTime: string | null

  @column()
  declare endTime: string | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime | null
}
