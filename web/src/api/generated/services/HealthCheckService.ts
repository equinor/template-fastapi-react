/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HealthCheckService {

    /**
     * Get
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getHealthCheckGet(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health-check',
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
