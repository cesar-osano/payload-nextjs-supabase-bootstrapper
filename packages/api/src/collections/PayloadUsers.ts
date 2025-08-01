import type { CollectionConfig } from 'payload'

export const PayloadUsers: CollectionConfig = {
  slug: 'payload-users',
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  auth: true,
  fields: [
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Full name of the admin user',
      },
    },
  ],
}