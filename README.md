# YikYak Clone

(Name to be changed soon)

## Documentation

### Setup

1. Install dependencies

- [NodeJS](https://nodejs.org/en/download/) (LTS recommended)
- [Git](https://git-scm.com/downloads)
- If running Supabase locally:
  - [Docker/Docker Engine](https://docs.docker.com/engine/install/)

2. Clone the repository:

```bash
git clone https://github.com/ColoradoSchoolOfMines/yikyak-clone.git
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

5. Still inside the repository, start the development server:

```bash
npm run dev
```

6. Open [`http://localhost:3000`](http://localhost:3000) in your browser
7. Reset the backend (optional):

```bash
npm run supabase:reset
```

### Technologies

- Frontend
  - Language: [TypeScript](https://www.typescriptlang.org)
  - Web framework: [React](https://reactjs.org) + [Vite](https://vitejs.dev)
  - Mobile framework: [Capacitor](https://capacitorjs.com)
  - Component library: [Ionic React](https://ionicframework.com/docs/react)
  - Styling: [UnoCSS (Wind preset)](https://unocss.dev/presets/wind#wind-preset) (Tailwind/WindiCSS compatible)
- Backend: [Supabase](https://supabase.com)
