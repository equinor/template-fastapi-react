/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class HealthCheckService {

    /**
     * Get Health Status
     * Check health of API
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getHealthStatusHealthCheckGet(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health-check',
        });
    }

}
