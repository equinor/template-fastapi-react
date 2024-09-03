/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessLevel } from './AccessLevel';

export type User = {
    user_id: string;
    email: (string | null);
    full_name: (string | null);
    roles: Array<string>;
    scope: AccessLevel;
};

