# Threat Model (High Level)

## Threats & Mitigations

### Token theft (XSS)
- Refresh token stored in **httpOnly cookie**
- Access token is short-lived

### Brute force / credential stuffing
- Rate limiting on auth endpoints
- In real systems: account lockout, CAPTCHA, anomaly detection

### SQL injection / input attacks
- Input validation (Zod)
- In real systems: parameterized queries + ORM/Query builder

### Session fixation / replay
- In real systems: refresh token rotation + revoke on reuse
- Store hashed refresh tokens with device metadata
