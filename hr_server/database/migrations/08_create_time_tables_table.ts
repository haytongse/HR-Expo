import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'time_tables'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('shift_schedule_id').unsigned().nullable()
      table.integer('day_of_week').notNullable()
      table.string('label').notNullable()
      table.string('start_time').nullable()
      table.string('end_time').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()

      table.foreign('shift_schedule_id').references('shift_schedules.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
