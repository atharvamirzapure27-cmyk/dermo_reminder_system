# Production Deployment Checklist for Dermatology Reminder System

Use this checklist to ensure all security parameters, environment configurations, and validation steps are completed before live hosting.

---

## 1. Environment Configurations
- [ ] **`NODE_ENV`**: Set to `production` in host variables.
- [ ] **`JWT_SECRET`**: Replace the fallback secret with a secure, generated 64-character hex sequence.
- [ ] **`PORT`**: Verify the target backend listener matches public port configurations (Default: `3001`).
- [ ] **`DB_PASSWORD`**: Replace default database passwords (like root or root123) with strong production credentials.

## 2. Twilio Business Channels
- [ ] **WhatsApp Business Profile**: Ensure your Twilio WhatsApp sender number is verified by Meta.
- [ ] **Twilio Sandbox**: Turn off `MOCK_SMS=false` to route real SMS, WhatsApp texts, and Voice calls to patients.
- [ ] **Billing Credits**: Ensure your Twilio account has active billing credits to prevent dispatch timeouts.

## 3. Security Guidelines
- [ ] **SSL Certificates**: Set up an Nginx reverse proxy or cloud balancer (like AWS ALB or Cloudflare) with HTTPS enabled to encrypt traffic.
- [ ] **HTTP Headers**: Enable security headers (e.g. Helmet middleware or proxy rules) to prevent framing, sniffing, or clickjacking.
- [ ] **CORS**: Configure the CORS origin list in `.env` to restrict requests strictly to the host domain.

## 4. Logging & Monitoring
- [ ] **Logs Folder**: Verify write permissions for the `/logs` directory.
- [ ] **Log Rotation**: Configure a system logrotate cron job or integrate a monitoring agent to prevent logs from eating disk space.
- [ ] **Process Manager**: Use PM2 (`pm2 start server.js --name "dermo-reminder-system"`) or Docker Compose with `restart: always` to handle automated app recovery on crashes.
