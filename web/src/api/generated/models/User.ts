/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessLevel } from './AccessLevel';

export type User = {
    user_id: string;
    email?: string;
    full_name?: string;
    roles?: Array<string>;
    scope?: AccessLevel;
};

