import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Announcement from '#models/announcement'

export default class AnnouncementPhoto extends BaseModel {
  static table = 'announcement_photos'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'announcement_id' })
  declare announcementId: number

  @column({ columnName: 'photo_path' })
  declare photoPath: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @belongsTo(() => Announcement)
  declare announcement: BelongsTo<typeof Announcement>
}
