import { CollectionConfig } from 'payload';

const Groups: CollectionConfig = {
  slug: 'groups',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'description', 'createdAt'],
    group: 'User Management',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'permissions',
      type: 'relationship',
      relationTo: 'permissions',
      hasMany: true,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
};

export default Groups;