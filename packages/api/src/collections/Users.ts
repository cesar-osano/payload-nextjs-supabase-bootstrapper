import type { CollectionConfig } from 'payload'
import { beforeChangeHook } from '../hooks/users/beforeChange'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'User Management',
    listSearchableFields: ['email', 'name'],
    description: '🔄 To resend invites: Use the admin tool at /admin/resend-invites or the "Request New Invite" feature on the login page',
  },
  hooks: {
    beforeChange: [beforeChangeHook],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        description: 'User email address',
      },
    },
    {
      name: 'name',
      type: 'text',
      admin: {
        description: 'Full name of the user',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants',
      required: true,
      admin: {
        description: 'The tenant/company this user belongs to',
      },
    },
    {
      name: 'groups',
      type: 'relationship',
      relationTo: 'groups',
      hasMany: true,
    },
    {
      name: 'supabaseId',
      type: 'text',
      admin: {
        description: 'Supabase user ID for authentication',
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'User phone number',
      },
    },
    {
      name: 'emailConfirmedAt',
      type: 'date',
      admin: {
        description: 'Timestamp when email was confirmed',
        readOnly: true,
      },
    },
    {
      name: 'phoneConfirmedAt',
      type: 'date',
      admin: {
        description: 'Timestamp when phone was confirmed',
        readOnly: true,
      },
    },
    {
      name: 'lastSignInAt',
      type: 'date',
      admin: {
        description: 'Timestamp of last sign in',
        readOnly: true,
      },
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        description: 'Account creation timestamp',
        readOnly: true,
      },
    },
    {
      name: 'updatedAt',
      type: 'date',
      admin: {
        description: 'Account last updated timestamp',
        readOnly: true,
      },
    },
    {
      name: 'userMetadata',
      type: 'json',
      admin: {
        description: 'User metadata from Supabase (editable by user)',
        readOnly: true,
      },
    },
    {
      name: 'appMetadata',
      type: 'json',
      admin: {
        description: 'App metadata from Supabase (read-only for user)',
        readOnly: true,
      },
    },
    {
      name: 'isConfirmed',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Whether the user has confirmed their email and set password',
        readOnly: true,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether this user account is active',
      },
    },
    {
      name: 'inviteActions',
      type: 'ui',
      admin: {
        components: {
          Field: '/app/(payload)/admin/components/ResendInviteField',
        },
      },
    },
  ],
}
