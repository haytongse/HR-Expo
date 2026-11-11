import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'check_ins'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('shift_period', 100).nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('shift_period', 20).nullable().alter()
    })
  }
}
