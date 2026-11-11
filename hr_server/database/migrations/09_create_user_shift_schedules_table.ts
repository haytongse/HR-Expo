import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_shift_schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('user_id').unsigned().nullable()
      table.integer('shift_schedule_id').unsigned().nullable()
      table.integer('assigned_by').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()

      table.unique(['user_id', 'shift_schedule_id'])
      table.foreign('user_id').references('users.id').onDelete('CASCADE')
      table.foreign('shift_schedule_id').references('shift_schedules.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
