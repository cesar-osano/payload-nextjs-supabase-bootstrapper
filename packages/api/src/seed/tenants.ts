import { type Payload } from 'payload'

export const seedTenants = async (payload: Payload) => {
  const tenants = [
    {
      name: 'Acme Corporation',
      description: 'A leading technology company specializing in innovative solutions',
      website: 'https://acme-corp.com',
      contactEmail: 'contact@acme-corp.com',
      contactPhone: '+1-555-0123',
      address: {
        street: '123 Tech Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'USA',
      },
      isActive: true,
    },
    {
      name: 'Global Industries Ltd',
      description: 'International manufacturing and distribution company',
      website: 'https://global-industries.com',
      contactEmail: 'info@global-industries.com',
      contactPhone: '+1-555-0456',
      address: {
        street: '456 Industrial Ave',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA',
      },
      isActive: true,
    },
  ]

  for (const tenant of tenants) {
    const existingTenant = await payload.find({
      collection: 'tenants',
      where: {
        name: { equals: tenant.name },
      },
    })

    if (existingTenant.docs.length === 0) {
      await payload.create({
        collection: 'tenants',
        data: tenant,
      })
      console.log(`Created tenant: ${tenant.name}`)
    } else {
      console.log(`Tenant ${tenant.name} already exists`)
    }
  }
}