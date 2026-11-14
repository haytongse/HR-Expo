import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'document_numbering'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().notNullable()          // e.g. 'EMP'
      table.string('label').notNullable()                  // e.g. 'Employee Code'
      table.string('prefix').notNullable()                 // e.g. 'EMP'
      table.string('separator').notNullable().defaultTo('') // e.g. '' or '-'
      table.integer('padding').unsigned().notNullable().defaultTo(3)
      table.integer('next_number').unsigned().notNullable().defaultTo(1)
      table.integer('campus_id').unsigned().nullable().references('id').inTable('campuses').onDelete('SET NULL')
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
