<h1>AgenceX Landing page</h1>

LaunchLegit's blog and case studies are connected to a standalone Sanity Studio. See [Sanity setup, migration and publishing](docs/sanity.md) for local development and activation instructions.

A simple landing page for a digital agency

![AgenceX light Theme](./screens/demoLight.webp)
![AgenceX Dark Theme](./screens/demoDark.webp)


## Tools
- TailwindCSS v3
- AstroJs v5


## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
│   ├── images/
│   ├── logos/*
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── blocks/*
│   │   ├── cards/*
│   │   ├── elements/*
│   │   ├── sections/*
│   │   ├── shared/*
│   ├── layouts/
│   │   └── Layout.astro
│   └── pages/
│       └── index.astro
├── package.json
└── tailwind.config.cjs
```


## 🧞 Commands

All commands are run from the root of the project, from a terminal:

Use the Node version pinned in `.nvmrc` before starting the server:

```sh
nvm use
npm run dev
```

If `nvm` is not loaded in your terminal, run `source ~/.nvm/nvm.sh` first.
The project requires Node.js 22.12 or newer. Older versions can fail with
`value.toWellFormed is not a function` when fetching content. After switching
Node versions, stop and restart any existing dev server in that same terminal.

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `npm install`          | Installs dependencies                            |
| `npm run dev`          | Starts local dev server at `localhost:4321`      |
| `npm run build`        | Build your production site to `./dist/`          |
| `npm run preview`      | Preview your build locally, before deploying     |
| `npm run astro ...`    | Run CLI commands like `astro add`, `astro check` |
| `npm run astro --help` | Get help using the Astro CLI                     |
