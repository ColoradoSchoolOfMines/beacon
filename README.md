# Beacon

<p align="center">
  <img alt="Beacon card" height="640" width="512" src="src/assets/card.png">
</p>

A location-based social network.

[![Release Status](https://img.shields.io/github/actions/workflow/status/ColoradoSchoolOfMines/beacon/release.yml?label=Release&style=flat-square)](https://github.com/ColoradoSchoolOfMines/beacon/actions/workflows/release.yml)

> [!WARNING]
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

# Check the status of the Supabase (Including the dashboard URL and mock email server URL)
npm run supabase:status
```

and then update [`supabase/functions/.env`](supabase/functions/.env) with the appropriate values (See [Function Environment Variables](#function-environment-variables)).

5. Update [`.env`](.env) (Different than the preceding `supabase/functions/.env` file) with the appropriate values (See [Frontend Environment Variables](#frontend-environment-variables)).

6. Still inside the repository, start the development server:

```bash
npm run dev
```

7. If running Supabase locally, start the Supabase functions:

```bash
npm run supabase:functions
```

8. Open [`http://localhost:3000`](http://localhost:3000) in your browser to access the frontend

9. If running Supabase locally, reset the database after each schema change:

```bash
npm run supabase:reset
```

### Production

#### Build

To build the frontend for production, run:

```bash
docker build -t beacon -f deployment/frontend.dockerfile .
```

#### Run

To run the frontend in production, run:

```bash
docker run -p 80:8080 beacon
```

### Frontend Environment Variables

| Development Name (i.e.: not in the container) | Production Name (i.e.: in the container) | Description                                     | Default/Required                                                                                                         |
| --------------------------------------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `VITE_HCAPTCHA_SITE_KEY`                      | `CADDY_HCAPTCHA_SITE_KEY`                | The hCaptcha site key                           | Required ( :warning: **Must be manually set** :warning:; see [hCaptcha dashboard](https://dashboard.hcaptcha.com/sites)) |
| `VITE_SUPABASE_FUNCTIONS_URL`                 | `CADDY_SUPABASE_FUNCTIONS_URL`           | The absolute base URL of the Supabase functions | Defaults to the Supabase API URL                                                                                         |
| `VITE_SUPABASE_URL`                           | `CADDY_SUPABASE_URL`                     | The absolute Supabase API URL                   | Required (Automatically set by the setup script)                                                                         |
| `VITE_SUPABASE_ANON_KEY`                      | `CADDY_SUPABASE_ANON_KEY`                | The Supabase API anonymous key                  | Required (Automatically set by the setup script)                                                                         |

### Function Environment Variables

| Name                          | Description                           | Default/Required                                         |
| ----------------------------- | ------------------------------------- | -------------------------------------------------------- |
| `WEBAUTHN_RP_ID`              | The WebAuthn Relying Party ID         | Defaults `beacon.localhost`                              |
| `WEBAUTHN_RP_ORIGIN`          | The WebAuthn Relying Party origin     | Defaults to `https://WEBAUTHN_RP_ID`                     |
| `WEBAUTHN_RP_NAME`            | The WebAuthn Relying Party name       | Defaults to `Beacon Social Network`                      |
| `HCAPTCHA_SITE_KEY`           | The hCaptcha site key                 | Required ( :warning: **Must be manually set** :warning:) |
| `HCAPTCHA_SECRET_KEY`         | The hCaptcha secret key               | Required ( :warning: **Must be manually set** :warning:) |
| `X_SUPABASE_DB_URL`           | The Supabase database URL             | Required (Automatically set by the runtime)              |
| `X_SUPABASE_URL`              | The Supabase API URL                  | Required (Automatically set by the runtime)              |
| `X_SUPABASE_ANON_KEY`         | The Supabase API anonymous key        | Required (Automatically set by the runtime)              |
| `X_SUPABASE_SERVICE_ROLE_KEY` | The Supabase API service role key     | Required (Automatically set by the runtime)              |
| `X_SUPABASE_JWT_SECRET`       | The Supabase JWT secret               | Required (Automatically set by the setup script)         |
| `X_SUPABASE_JWT_ISSUER`       | The Supabase JWT issuer               | Required (Automatically set by the setup script)         |
| `X_SUPABASE_JWT_EXP`          | The Supabase JWT expiration (Seconds) | Defaults to `3600` seconds (`1` hour)                    |

### Technologies

- Frontend
  - Language: [TypeScript](https://www.typescriptlang.org)
  - Web framework: [React](https://reactjs.org) + [Vite](https://vitejs.dev)
  - Mobile framework: [Capacitor](https://capacitorjs.com)
  - Component library: [Ionic React](https://ionicframework.com/docs/react)
  - Styling: [UnoCSS (Wind preset)](https://unocss.dev/presets/wind#wind-preset) (Tailwind/WindiCSS compatible)
- Backend: [Supabase](https://supabase.com)

### Algorithm

Beacon's ranking algorithm is somewhat inspired by the [Lemmy algorithm](https://join-lemmy.org/docs/contributors/07-ranking-algo.html), but has the following properties:

| Description                         | Reasoning                                                                                                                                      |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Quadratic distance **contribution** | Posts that are closer to the user should have a higher rank. This helps users see posts that are more geographically relevant to them.         |
| Logarithmic score **contribution**  | The first $10$, next $100$, next $1000$, etc. votes should have the same contribution to the rank. This helps counteract the bandwagon effect. |
| Exponential age **reduction**       | The older a post is, the less relevant it likely is. This helps newer posts rank higher.                                                       |

The algorithm is as follows:

$$
\text{Distance component} = (\text{Distance weight} - 1) \cdot (\min\bigg(1, \frac{\text{Distance}}{\text{Distance range}}\bigg) - 1)^{2} + 1
$$

$$
\text{Score component} = \log_{10}(\max(1, (\text{Upvotes} - \text{Downvotes}) - \text{Score threshold} + 1))
$$

$$
\text{Age component} = \text{Age weight}^{- \text{Age}}
$$

$$
\text{Rank} = \lfloor(\text{Scale} \cdot \text{Distance component} \cdot \text{Score component} \cdot \text{Age component}\rfloor
$$

with the following variables:

| Name                     | Definition                                                    | Min value                    | Default value | Max value |
| ------------------------ | ------------------------------------------------------------- | ---------------------------- | ------------- | --------- |
| $\text{Rank}$            | Integer post sorting order (Higher will be sorted first)      | -                            | -             | -         |
| $\text{Scale}$           | Ranking scale factor (To allow the rank to be rounded)        | $1$ (Don't rank)             | $10000$       | -         |
| $\text{Distance}$        | Distance between the post and the user's location (In meters) | -                            | -             | -         |
| $\text{Distance weight}$ | Distance weight factor                                        | $1$ (Don't rank by distance) | $5$           | -         |
| $\text{Distance range}$  | Maximum distance to be considered (In meters)                 | $1$                          | $5000$        | $50000$   |
| $\text{Upvotes}$         | Post upvotes                                                  | -                            | -             | -         |
| $\text{Downvotes}$       | Post downvotes                                                | -                            | -             | -         |
| $\text{Score threshold}$ | Minimum score threshold considered                            | $-5$                         | $-5$          | -         |
| $\text{Age}$             | Post age (In hours)                                           | -                            | -             | -         |
| $\text{Age weight}$      | Age weight factor                                             | $1$ (Don't weight by age)    | $1.075$       | -         |
