import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'public_holidays'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name').notNullable()
      table.date('date').notNullable()
      table.integer('amount_day').notNullable().defaultTo(1)
      table.text('description').nullable()
      table.integer('year').notNullable()
      table.integer('month').notNullable()
      table.integer('day').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
