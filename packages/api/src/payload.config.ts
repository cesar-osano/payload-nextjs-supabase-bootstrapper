// storage-adapter-import-placeholder
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { PayloadUsers } from './collections/PayloadUsers'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import Groups from './collections/Groups'
import Permissions from './collections/Permissions'
import Tenants from './collections/Tenants'
import { getDatabaseAdapter } from './config/database'
import { seed } from './seed'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: PayloadUsers.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [PayloadUsers, Users, Media, Groups, Permissions, Tenants],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: getDatabaseAdapter(),
  sharp,
  onInit: async (payload) => {
    if (process.env.SEED_DATABASE === 'true') {
      await seed(payload)
    }
  },
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
