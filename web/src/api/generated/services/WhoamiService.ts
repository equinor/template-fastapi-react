/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class WhoamiService {

    /**
     * Get Information On Authenticated User
     * @returns User Successful Response
     * @throws ApiError
     */
    public static whoami(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/whoami',
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
