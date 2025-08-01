import { type Payload } from 'payload'
import { seedGroups } from './groups'
import { seedTenants } from './tenants'

export const seed = async (payload: Payload) => {
  console.log('Starting seed process...')
  
  try {
    await seedTenants(payload)
    await seedGroups(payload)
    console.log('Seed process completed successfully')
  } catch (error) {
    console.error('Error during seed process:', error)
    throw error
  }
}