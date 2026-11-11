import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'check_ins'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.integer('user_id').unsigned().nullable()
      table.specificType(
        'check_in_time',
        'TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      )
      table.decimal('latitude', 10, 8).nullable()
      table.decimal('longitude', 11, 8).nullable()
      table.string('address').nullable()
      table.string('street').nullable()
      table.string('village').nullable()
      table.string('district').nullable()
      table.string('country').nullable()
      table.string('photo_path').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()
      table.integer('year').nullable()
      table.integer('month').nullable()
      table.integer('day').nullable()
      table.string('time').nullable()
      table.integer('day_of_week').nullable()
      table.string('scan_type', 20).notNullable().defaultTo('check_in')
      table.string('shift_period', 20).nullable()
      table.integer('time_table_id').unsigned().nullable()

      table.foreign('user_id').references('users.id').onDelete('CASCADE')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
