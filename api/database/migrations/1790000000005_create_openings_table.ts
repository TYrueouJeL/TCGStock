import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * One row per opening session: "I opened 3 boosters of set X on this date".
 */
export default class extends BaseSchema {
  protected tableName = 'openings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .notNullable()
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.integer('game_id').notNullable().unsigned().references('id').inTable('games')
      table.integer('extension_id').notNullable().unsigned().references('id').inTable('extensions')
      table.string('product_type', 20).notNullable()
      table.integer('quantity').notNullable().defaultTo(1)
      table.decimal('unit_price', 10, 2).nullable()
      table.decimal('pulled_value', 10, 2).nullable()
      table.date('opened_on').notNullable()
      table.text('notes').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
      table.index(['user_id', 'opened_on'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
