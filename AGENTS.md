We use yarn

# Architecture & Project Conventions

### Core Stack
- **Framework:** Node.js with Hono (`@hono/node-server`).
- **Language:** TypeScript.
- **Environment:** Docker (multi-arch).
- **Video Tools:** `yt-dlp` (via `yt-dlp-exec`) for downloading, and `ffmpeg` (via `fluent-ffmpeg`) for transcoding to `.ogv`.
- **Infrastructure:** Cloudflare R2 (Storage) & Cloudflare D1 (Database).

### Architecture & Separation of Concerns (SoC)
To keep the codebase maintainable, we strictly adhere to:
1. **Routes (`src/routes/`)**: Definitions mapping HTTP methods and paths to Controllers.
2. **Controllers (`src/controllers/`)**: Handle HTTP requests/responses, extract parameters, trigger workflows.
3. **Services (`src/services/`)**: The core business logic. Separation for YouTube download logic, ffmpeg conversion, Cloudflare communication, and overarching pipelines.
4. **State (`src/state/`)**: In-memory state tracking or external database definitions.
5. **Constants (`src/constants/`)**: Reusable magic strings, paths, and limits.

### CI/CD
Every pull request and push to main gets built and linted via GitHub Actions.
Releases/tags trigger a Docker image publish workflow resulting in multi-arch (`amd64` / `arm64`) images hosted on `ghcr.io`.