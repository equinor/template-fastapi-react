import { z } from 'zod'

// Zod probes Function() when constructing object schemas; strict CSP forbids it.
z.config({ jitless: true })
