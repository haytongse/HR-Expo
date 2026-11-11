import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'campuses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').unsigned().notNullable()
      table.string('code').notNullable()
      table.string('full_name').notNullable()
      table.string('address').nullable()
      table.string('phone_number').nullable()
      table.string('email').nullable()
      table.string('website').nullable()
      table.string('logo').nullable()
      table.integer('status').notNullable()
      table.string('description').nullable()
      table.integer('start_counts').notNullable()
      table.decimal('allow_meter', 10, 2).nullable()
      table.decimal('lat', 10, 8).nullable()
      table.decimal('long', 11, 8).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
