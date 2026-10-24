export interface ApiFieldError {
    field: string
    message: string
}

export interface ApiErrorResponse {
    code: string
    message: string
    errors?: ApiFieldError[]
}

export interface ListMeta {
    total: number
    skip: number
    limit: number
}

export interface ListResponse<T> {
    items: T[]
    meta: ListMeta
}
