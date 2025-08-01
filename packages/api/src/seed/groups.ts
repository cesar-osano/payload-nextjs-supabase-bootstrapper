import { type Payload } from 'payload'

export const seedGroups = async (payload: Payload) => {
  const groups = [
    {
      name: 'Field',
      description: 'Field operations team members responsible for on-site activities',
      isActive: true,
    },
    {
      name: 'Office',
      description: 'Office-based administrative and management staff',
      isActive: true,
    },
    {
      name: 'Warehouse',
      description: 'Warehouse operations team handling inventory and logistics',
      isActive: true,
    },
  ]

  for (const group of groups) {
    const existingGroup = await payload.find({
      collection: 'groups',
      where: {
        name: { equals: group.name },
      },
    })

    if (existingGroup.docs.length === 0) {
      await payload.create({
        collection: 'groups',
        data: group,
      })
      console.log(`Created group: ${group.name}`)
    } else {
      console.log(`Group ${group.name} already exists`)
    }
  }
}