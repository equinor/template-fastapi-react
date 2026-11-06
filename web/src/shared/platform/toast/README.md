# Notifications

The local toast store and EDS Snackbar container have been removed. Use
`useCustomToast` from `@team-hermes/react-components` inside React components.
`Providers` mounts one `react-toastify` `ToastContainer` at bottom-right.
`index.tsx` imports both Hermes and React Toastify stylesheets.

```tsx
const toast = useCustomToast()
toast.success('Todo created')
toast.error('Could not delete todo', 'Please try again.')
toast.info('Upload', 'Uploading...', false)
```

Bootstrap injects the hook's callbacks into `createQueryClient({ telemetry, toast })`
for non-React query/mutation notifications. Keep the 401 suppression and the
`toast.error` correlation event there. Query retry/invalidation policy stays in
`shared/platform/api`.

Hermes defaults: success 3 seconds, error 8 seconds, warning 5 seconds, info sticky.
The partial bulk-delete notification explicitly closes after 8 seconds.
Unlike the removed store, identical messages are not deduplicated and long messages
are not truncated. Hermes owns the message content and close button; React Toastify
owns dismissal, progress, and accessibility (`role="alert"` for all variants).
`app/bootstrap/notifications.test.tsx` and the TodosPage integration test cover
the consumer boundary.
