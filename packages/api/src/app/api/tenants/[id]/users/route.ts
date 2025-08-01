import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '@payload-config'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await getPayloadHMR({ config: configPromise })
    const { searchParams } = new URL(request.url)
    
    // Extract pagination parameters
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Extract sorting parameters
    const sort = searchParams.get('sort') || '-createdAt'
    
    // Extract search parameters
    const search = searchParams.get('search')
    
    // Extract depth parameter (default to 0)
    const depth = parseInt(searchParams.get('depth') || '0')
    
    // Build where clause
    const where: any = {
      tenant: {
        equals: params.id
      }
    }
    
    // Add search functionality if search term provided
    if (search) {
      where.or = [
        {
          email: {
            contains: search
          }
        }
      ]
    }
    
    // Extract additional filter parameters
    const isActive = searchParams.get('isActive')
    if (isActive !== null) {
      where.isActive = {
        equals: isActive === 'true'
      }
    }
    
    const groups = searchParams.get('groups')
    if (groups) {
      where.groups = {
        in: groups.split(',')
      }
    }
    
    // Query users for the specific tenant
    const result = await payload.find({
      collection: 'users',
      where,
      page,
      limit,
      sort: sort.split(','),
      depth, // Configurable depth (default: 0)
    })
    
    // Verify tenant exists
    const tenant = await payload.findByID({
      collection: 'tenants',
      id: params.id,
    })
    
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      )
    }
    
    // Return paginated response with same structure as Payload API
    return NextResponse.json({
      docs: result.docs,
      totalDocs: result.totalDocs,
      limit: result.limit,
      totalPages: result.totalPages,
      page: result.page,
      pagingCounter: result.pagingCounter,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      tenant: {
        id: tenant.id,
        name: tenant.name,
      }
    })
    
  } catch (error) {
    console.error('Error fetching tenant users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}