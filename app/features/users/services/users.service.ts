import { apiClient } from '~/lib/api/client'
import type {
    User,
    UserListResponse,
    CreateUserPayload,
    UpdateUserPayload
} from '~~/shared/types/user.types'

export async function listUsers(
    params: { skip?: number; limit?: number; search?: string } = {}
): Promise<UserListResponse> {
    const query: Record<string, string | number | boolean> = {
        skip: params.skip ?? 0,
        limit: params.limit ?? 10
    }
    if (params.search) {
        query.search = params.search
    }
    return await apiClient<UserListResponse>('/users', { query })
}

export async function getUser(id: number): Promise<User> {
    return await apiClient<User>(`/users/${id}`)
}

export async function createUser(payload: CreateUserPayload): Promise<User> {
    return await apiClient<User>('/users', {
        method: 'POST',
        body: payload
    })
}

export async function updateUser(id: number, payload: UpdateUserPayload): Promise<User> {
    return await apiClient<User>(`/users/${id}`, {
        method: 'PUT',
        body: payload
    })
}

export async function deleteUser(id: number): Promise<void> {
    await apiClient(`/users/${id}`, {
        method: 'DELETE'
    })
}
