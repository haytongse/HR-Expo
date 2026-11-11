import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Role from '#models/role'
import Campus from '#models/campus'

export default class DatabaseSeeder extends BaseSeeder {
  async run() {
    // Seed default roles
    const roles = ['spa', 'admin', 'user']
    for (const name of roles) {
      await Role.updateOrCreate({ name }, { name })
    }

    // Seed default admin user
    await User.updateOrCreate(
      { email: 'admin@hrd.com' },
      {
        fullName: 'Admin',
        email: 'admin@hrd.com',
        password: 'Admin@1234',
        role: 'admin',
      }
    )

    // Seed default campus
    await Campus.updateOrCreate(
      { code: 'DF' },
      {
        code: 'DF',
        fullName: 'default',
        address: null,
        phoneNumber: null,
        email: null,
        website: null,
        logo: null,
        status: 1,
        description: null,
        startCounts: 1,
        allowMeter: 30.0,
        lat: 11.704034,
        long: 104.941797,
      }
    )
  }
}
