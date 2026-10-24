import type { User, CreateUserPayload, UpdateUserPayload } from '~~/shared/types/user.types'
import { UserStatus } from '~~/shared/types/user.types'
import type { AuthTokens, SessionInfo } from '~~/shared/types/auth.types'

interface StoredMockUser extends User {
    password: string
}

const INITIAL_USERS: StoredMockUser[] = [
    {
        id: 1,
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        status_id: UserStatus.ACTIVE,
        version: 1,
        avatar_url:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: 2,
        name: 'Sarah Connor',
        email: 'sarah@example.com',
        password: 'password123',
        status_id: UserStatus.ACTIVE,
        version: 1,
        avatar_url:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
        created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: 3,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        status_id: UserStatus.PENDING,
        version: 1,
        created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
    },
    {
        id: 4,
        name: 'Alex Rivera',
        email: 'alex@example.com',
        password: 'password123',
        status_id: UserStatus.INACTIVE,
        version: 1,
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
    }
]

const store = {
    users: JSON.parse(JSON.stringify(INITIAL_USERS)) as StoredMockUser[]
}

export function resetMockStore() {
    store.users = JSON.parse(JSON.stringify(INITIAL_USERS))
}

export function getMockUsersList(): StoredMockUser[] {
    return store.users
}

export function verifyMockCredentials(email: string, password: string): User | null {
    const user = store.users.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (!user || user.password !== password) {
        return null
    }
    const { password: _, ...safeUser } = user
    return safeUser
}

export function getMockUserById(id: number): User | null {
    const user = store.users.find(u => u.id === id)
    if (!user) return null
    const { password: _, ...safeUser } = user
    return safeUser
}

export function generateMockAuthTokens(userId: number): AuthTokens {
    return {
        access_token: `mock_jwt_access_token_user_${userId}_${Date.now()}`,
        refresh_token: `mock_jwt_refresh_token_user_${userId}_${Date.now()}`,
        expires_in: 3600,
        token_type: 'Bearer'
    }
}

export function listMockUsers(skip = 0, limit = 10, search = ''): { items: User[]; total: number } {
    let filtered = store.users.map(({ password: _, ...safe }) => safe)
    if (search) {
        const q = search.toLowerCase()
        filtered = filtered.filter(
            u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
        )
    }
    const total = filtered.length
    const items = filtered.slice(skip, skip + limit)
    return { items, total }
}

export function createMockUser(payload: CreateUserPayload): User {
    const existing = store.users.find(u => u.email.toLowerCase() === payload.email.toLowerCase())
    if (existing) {
        throw createError({
            statusCode: 400,
            data: { code: 'E_USER_ALREADY_EXISTS', message: 'User already exists' }
        })
    }

    const newId = Math.max(...store.users.map(u => u.id), 0) + 1
    const newUser: StoredMockUser = {
        id: newId,
        name: payload.name,
        email: payload.email,
        password: payload.password,
        status_id: 2, // ACTIVE
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }

    store.users.unshift(newUser)
    const { password: _, ...safe } = newUser
    return safe
}

export function updateMockUser(id: number, payload: UpdateUserPayload): User {
    const index = store.users.findIndex(u => u.id === id)
    if (index === -1) {
        throw createError({
            statusCode: 404,
            data: { code: 'E_NOT_FOUND', message: 'User not found' }
        })
    }

    const current = store.users[index]

    // Optimistic locking verification
    if (current.version !== payload.version) {
        throw createError({
            statusCode: 409,
            data: { code: 'E_CONFLICT', message: 'Resource has been updated by another process' }
        })
    }

    const updated: StoredMockUser = {
        ...current,
        name: payload.name,
        email: payload.email,
        status_id: payload.status_id,
        version: current.version + 1,
        updated_at: new Date().toISOString()
    }

    store.users[index] = updated
    const { password: _, ...safe } = updated
    return safe
}

export function deleteMockUser(id: number): boolean {
    const index = store.users.findIndex(u => u.id === id)
    if (index === -1) return false
    store.users.splice(index, 1)
    return true
}

export function listMockSessions(userId: number): SessionInfo[] {
    return [
        {
            id: 'sess_current',
            user_id: String(userId),
            ip_address: '127.0.0.1',
            user_agent: 'Current Browser Session',
            created_at: Date.now() - 3600000,
            expires_at: Date.now() + 7 * 24 * 3600000
        }
    ]
}
