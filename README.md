# Beacon

<p align="center">
  <img alt="Beacon logo" height="256" width="256" src="src/assets/logo.png">
</p>

A location-based social network.

> **Warning**
> This project is under active development and is not yet ready for production use.

## Documentation

### Setup

1. Install dependencies

- [NodeJS](https://nodejs.org/en/download/) (LTS recommended)
- [Git](https://git-scm.com/downloads)
- If running Supabase locally:
  - [Docker/Docker Engine](https://docs.docker.com/engine/install/)

2. Clone the repository:

```bash
git clone https://github.com/ColoradoSchoolOfMines/beacon.git
```

3. Inside the repository, install the dependencies:

```bash
npm install
```

4. If you want to run Supabase locally, start the Docker container:

```bash
# This can take a while the first time you run it because it has to download a bunch of Docker images
npm run supabase:start
```

and then update [`supabase/functions/.env`](supabase/functions/.env) with the appropriate values (See [Function Environment Variables](#function-environment-variables)).

5. Update [`.env`](.env) with the appropriate values (See [Frontend Environment Variables](#frontend-environment-variables)).

6. Still inside the repository, start the development server:

```bash
npm run dev
```

7. Open [`http://localhost:3000`](http://localhost:3000) in your browser to access the frontend and [`http://localhost:54323`](http://localhost:54323) to access the local Supabase dashboard (If you're running Supabase locally).

8. Reset the backend (optional, but **strongly** recommended anytime after you change the backend schema):

```bash
npm run supabase:reset
```

### Frontend Environment Variables

| Name                     | Description                    | Default/Required                                                                                                        |
| ------------------------ | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `VITE_HCAPTCHA_SITE_KEY` | The hCaptcha site key          | Required (:warning: **Must be manually set** :warning:; see [hCaptcha dashboard](https://dashboard.hcaptcha.com/sites)) |
| `VITE_SUPABASE_URL`      | The Supabase API URL           | Required (Automatically set by the setup script)                                                                        |
| `VITE_SUPABASE_ANON_KEY` | The Supabase API anonymous key | Required (Automatically set by the setup script)                                                                        |

### Function Environment Variables

| Name                        | Description                           | Default/Required                                                |
| --------------------------- | ------------------------------------- | --------------------------------------------------------------- |
| `HCAPTCHA_SITE_KEY`         | The hCaptcha site key                 | Required (:warning: **Must be manually set** :warning:)         |
| `HCAPTCHA_SECRET_KEY`       | The hCaptcha secret key               | Required (:warning: **Must be manually set** :warning:)         |
| `SMTP_HOST`                 | The SMTP server host                  | Required (:warning: **Must be manually set** :warning:)         |
| `SMTP_PORT`                 | The SMTP server port                  | Defaults to `465`                                               |
| `SMTP_TLS`                  | Whether to use TLS                    | Defaults to `true` when `SMTP_PORT` is `465`, `false` otherwise |
| `SMTP_USERNAME`             | The SMTP server username              | Required (:warning: **Must be manually set** :warning:)         |
| `SMTP_PASSWORD`             | The SMTP server password              | Required (:warning: **Must be manually set** :warning:)         |
| `SMTP_FROM`                 | The SMTP server from address          | Defaults to `SMTP_USERNAME`                                     |
| `SUPABASE_DB_URL`           | The Supabase database URL             | Required (Automatically set by the runtime)                     |
| `SUPABASE_URL`              | The Supabase API URL                  | Required (Automatically set by the runtime)                     |
| `SUPABASE_ANON_KEY`         | The Supabase API anonymous key        | Required (Automatically set by the runtime)                     |
| `SUPABASE_SERVICE_ROLE_KEY` | The Supabase API service role key     | Required (Automatically set by the runtime)                     |
| `X_SUPABASE_JWT_SECRET`     | The Supabase JWT secret               | Required (Automatically set by the setup script)                |
| `X_SUPABASE_JWT_ISSUER`     | The Supabase JWT issuer               | Required (Automatically set by the setup script)                |
| `X_SUPABASE_JWT_EXP`        | The Supabase JWT expiration (Seconds) | Defaults to `3600` seconds (`1` hour)                           |

### Technologies

- Frontend
  - Language: [TypeScript](https://www.typescriptlang.org)
  - Web framework: [React](https://reactjs.org) + [Vite](https://vitejs.dev)
  - Mobile framework: [Capacitor](https://capacitorjs.com)
  - Component library: [Ionic React](https://ionicframework.com/docs/react)
  - Styling: [UnoCSS (Wind preset)](https://unocss.dev/presets/wind#wind-preset) (Tailwind/WindiCSS compatible)
- Backend: [Supabase](https://supabase.com)
