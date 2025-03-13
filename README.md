# Spotify Overlay

A Spotify overlay for your stream that shows what's currently playing.

## About

Spotify Overlay is a Next.js application that provides a customizable overlay for streamers to display their currently playing Spotify tracks on stream.

## Development

This project uses Next.js 15 with the App Router and Tailwind CSS for styling.

### Prerequisites

- Node.js 22+
- pnpm 8+

### Setup

```bash
pnpm install
```

### Running locally

```bash
pnpm dev
```

## Contributing

### Semantic Versioning

This project follows [Semantic Versioning](https://semver.org/) (SemVer) principles. The versioning is automatically handled through our CI/CD pipeline based on conventional commit messages.

#### Commit Message Format

For automatic versioning to work properly, please format your commit messages according to the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `fix: message` - for bug fixes (triggers a PATCH version bump `x.x.0 -> x.x.1`)
- `feat: message` - for new features (triggers a MINOR version bump `x.0.x -> x.1.x`)
- `feat!: message` or `fix!: message` - for breaking changes (triggers a MAJOR version bump `1.x.x -> 2.x.x`)
- `docs: message` - for documentation changes (no version bump)
- `style: message` - for formatting changes (no version bump)
- `refactor: message` - for code refactoring (no version bump)
- `perf: message` - for performance improvements (no version bump)
- `test: message` - for adding tests (no version bump)
- `chore: message` - for maintenance tasks (no version bump)

Examples:

```
feat: add new visualization for album artwork
fix: resolve playback issues on Firefox
docs: update installation instructions
feat!: redesign overlay with breaking changes to theming API
```

#### How It Works

1. We use [semantic-release](https://github.com/semantic-release/semantic-release) to automate versioning and release management
2. When you push to the `main` branch, our GitHub Actions workflow:
    - Analyzes commit messages since the last release
    - Determines the appropriate version bump (patch, minor, or major)
    - Updates the version in package.json
    - Creates a CHANGELOG entry
    - Commits these changes back to the repository (with `[skip ci]` to prevent loops)
    - Creates a GitHub Release
    - Builds and publishes a Docker image with the new version

### Deployment Process

The project is deployed through a Docker-based workflow:

1. When changes are merged to `main`, the CI/CD pipeline:
    - Runs the semantic versioning process
    - Builds a multi-architecture Docker image (amd64, arm64)
    - Tags the image with both `latest` and the specific version (e.g., `v1.2.3`)
    - Pushes the image to GitHub Container Registry
    - Triggers a Coolify deployment to update the production environment

### Pull Request Process

1. Fork the repo and create a branch for your feature or fix
2. Make your changes following the coding standards
3. Ensure your commit messages follow the Conventional Commits format
4. Submit a pull request to the `main` branch
5. Your PR will be reviewed and, if approved, merged
