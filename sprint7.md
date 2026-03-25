# Sprint 7 — SSO (Single Sign-On) Implementation

Goal: Integrate external identity providers for seamless user authentication.

## Backend Development (NestJS)
- [ ] Install Passport strategies for Google and GitHub
- [ ] Configure `google.strategy.ts` and `github.strategy.ts`
- [ ] Implement SSO endpoints in `auth.controller.ts`
- [ ] Update `user.schema.ts` to support SSO provider data
- [ ] Implement user auto-registration for first-time SSO logins

## Frontend Development (React)
- [ ] Design and implement SSO login buttons (Google, GitHub)
- [ ] Implement SSO callback handling and JWT storage
- [ ] Update login page layout for better UX with SSO options

## Security & Verification
- [ ] Verify CSRF protection for OAuth callbacks
- [ ] Test end-to-end authentication flow for both providers
- [ ] Ensure audit logs capture SSO login events

## Deliverable:
Secure and working SSO integration for Google and GitHub.
