import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import AnnouncementPhoto from '#models/announcement_photo'
import User from '#models/user'

export default class Announcement extends BaseModel {
  static table = 'announcements'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare title: string

  @column()
  declare body: string | null

  @column.dateTime({ columnName: 'scheduled_at' })
  declare scheduledAt: DateTime | null

  @column({ columnName: 'created_by' })
  declare createdBy: number | null

  @column()
  declare notified: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, { foreignKey: 'createdBy' })
  declare createdByUser: BelongsTo<typeof User>

  @hasMany(() => AnnouncementPhoto, { foreignKey: 'announcementId' })
  declare photos: HasMany<typeof AnnouncementPhoto>
}
