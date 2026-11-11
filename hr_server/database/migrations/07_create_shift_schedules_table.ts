import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shift_schedules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.string('start_date').notNullable()
      table.string('end_date').notNullable()
      table.integer('created_by').nullable()
      table.json('weekly_rules').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()
      table
        .integer('allow_time_before')
        .defaultTo(15)
        .comment('Minutes allowed before shift start time')
        .nullable()
      table
        .integer('allow_time_after')
        .defaultTo(15)
        .comment('Minutes allowed after shift end time')
        .nullable()
      table
        .integer('allow_amount_scan')
        .defaultTo(4)
        .comment('Maximum number of scans allowed per day')
        .nullable()
      table
        .integer('allow_time_second_scan')
        .defaultTo(30)
        .comment('Minimum seconds required between scans')
        .nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
