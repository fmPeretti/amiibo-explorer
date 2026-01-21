# Contributing to Amiibo Explorer

Thanks for wanting to contribute! This project was built in a weekend so there's plenty of room for improvements.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/fmPeretti/amiibo-explorer/issues)
2. If not, open a new issue with:
   - A clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Suggesting Features

Open an issue with the `enhancement` label describing:
- What you'd like to see
- Why it would be useful
- Any ideas on how to implement it

### Submitting Code

1. **Fork the repo** and clone it locally
2. **Create a branch** from `dev`:
   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes**
4. **Test locally** - make sure `npm run build` passes
5. **Commit** with a clear message
6. **Push** to your fork
7. **Open a PR** to `dev` (not `main`)

### Branch Naming

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring

### PR Guidelines

- PRs should target the `dev` branch
- Keep changes focused - one feature/fix per PR
- Include a description of what changed and why
- Add screenshots for UI changes

## Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/amiibo-explorer.git
cd amiibo-explorer

# Install dependencies
npm install

# Run development server
npm run dev
```

## Project Structure

- `src/app/` - Next.js pages (App Router)
- `src/components/` - React components
- `src/lib/` - Utilities and API clients
- `src/contexts/` - React contexts
- `public/` - Static assets

## Questions?

Open an issue or reach out. Happy coding!
