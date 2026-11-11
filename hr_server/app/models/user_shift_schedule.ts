import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import ShiftSchedule from '#models/shift_schedule'

export default class UserShiftSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number | null

  @column({ columnName: 'shift_schedule_id' })
  declare shiftScheduleId: number | null

  @column({ columnName: 'assigned_by' })
  declare assignedBy: number | null

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare updatedAt: DateTime | null

  @belongsTo(() => ShiftSchedule)
  declare shiftSchedule: BelongsTo<typeof ShiftSchedule>
}
