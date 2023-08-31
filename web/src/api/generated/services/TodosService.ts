/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AddTodoRequest } from '../models/AddTodoRequest';
import type { AddTodoResponse } from '../models/AddTodoResponse';
import type { DeleteTodoByIdResponse } from '../models/DeleteTodoByIdResponse';
import type { GetTodoByIdResponse } from '../models/GetTodoByIdResponse';
import type { UpdateTodoRequest } from '../models/UpdateTodoRequest';
import type { UpdateTodoResponse } from '../models/UpdateTodoResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TodosService {

    /**
     * Get Todo All
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getAll(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Add Todo
     * @param requestBody
     * @returns AddTodoResponse Successful Response
     * @throws ApiError
     */
    public static create(
        requestBody: AddTodoRequest,
    ): CancelablePromise<AddTodoResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/todos',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Get Todo By Id
     * @param id
     * @returns GetTodoByIdResponse Successful Response
     * @throws ApiError
     */
    public static getById(
        id: string,
    ): CancelablePromise<GetTodoByIdResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Delete Todo By Id
     * @param id
     * @returns DeleteTodoByIdResponse Successful Response
     * @throws ApiError
     */
    public static deleteById(
        id: string,
    ): CancelablePromise<DeleteTodoByIdResponse> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }

    /**
     * Update Todo
     * @param id
     * @param requestBody
     * @returns UpdateTodoResponse Successful Response
     * @throws ApiError
     */
    public static updateById(
        id: string,
        requestBody: UpdateTodoRequest,
    ): CancelablePromise<UpdateTodoResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/todos/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not Found`,
                422: `Unprocessable Entity`,
                500: `Internal Server Error`,
            },
        });
    }

}
