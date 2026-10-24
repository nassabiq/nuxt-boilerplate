import type { ListMeta } from './api.types'

export enum UserStatus {
    ACTIVE = 1,
    INACTIVE = 2,
    PENDING = 3,
    SUSPENDED = 4,
    BLOCKED = 5
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
    [UserStatus.PENDING]: 'Pending',
    [UserStatus.ACTIVE]: 'Active',
    [UserStatus.INACTIVE]: 'Inactive',
    [UserStatus.SUSPENDED]: 'Suspended',
    [UserStatus.BLOCKED]: 'Blocked'
}

export interface User {
    id: number
    name: string
    email: string
    status_id: UserStatus
    avatar_url?: string
    version: number
    created_at: string
    updated_at: string
}

export interface CreateUserPayload {
    name: string
    email: string
    password: string
}

export interface UpdateUserPayload {
    name: string
    email: string
    status_id: UserStatus
    version: number
}

export interface UserListResponse {
    items: User[]
    meta: ListMeta
}

export function isSuperAdminUser(user?: Pick<User, 'id' | 'email'> | null): boolean {
    if (!user) return false
    return user.id === 1 || user.email?.toLowerCase() === 'admin@example.com'
}

export enum UserSortOption {
    NEWEST = 'newest',
    OLDEST = 'oldest',
    NAME_ASC = 'name-asc',
    NAME_DESC = 'name-desc'
}

export const USER_SORT_LABELS: Record<UserSortOption, string> = {
    [UserSortOption.NEWEST]: 'Terbaru (ID Menurun)',
    [UserSortOption.OLDEST]: 'Terlama (ID Menaik)',
    [UserSortOption.NAME_ASC]: 'Nama (A - Z)',
    [UserSortOption.NAME_DESC]: 'Nama (Z - A)'
}

export const USER_SORT_COMPARATORS: Record<UserSortOption, (a: User, b: User) => number> = {
    [UserSortOption.NEWEST]: (a, b) => b.id - a.id,
    [UserSortOption.OLDEST]: (a, b) => a.id - b.id,
    [UserSortOption.NAME_ASC]: (a, b) => a.name.localeCompare(b.name),
    [UserSortOption.NAME_DESC]: (a, b) => b.name.localeCompare(a.name)
}

export function sortUsers(users: User[], option: UserSortOption | string): User[] {
    const comparator = USER_SORT_COMPARATORS[option as UserSortOption]
    return comparator ? [...users].sort(comparator) : [...users]
}
