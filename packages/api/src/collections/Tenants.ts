import { CollectionConfig } from 'payload';

const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'website', 'createdAt'],
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
      admin: {
        description: 'Company or organization name',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Company logo image',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Company website URL',
      },
      validate: (val) => {
        if (val && !val.match(/^https?:\/\/.+/)) {
          return 'Please enter a valid URL starting with http:// or https://';
        }
        return true;
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Brief description of the company',
      },
    },
    {
      name: 'address',
      type: 'group',
      fields: [
        {
          name: 'street',
          type: 'text',
        },
        {
          name: 'city',
          type: 'text',
        },
        {
          name: 'state',
          type: 'text',
        },
        {
          name: 'zipCode',
          type: 'text',
        },
        {
          name: 'country',
          type: 'text',
        },
      ],
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: {
        description: 'Primary contact email for the tenant',
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      admin: {
        description: 'Primary contact phone number',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this tenant is currently active',
      },
    },
  ],
};

export default Tenants;