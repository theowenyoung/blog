# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is Owen's personal blog built with [Zola](https://www.getzola.org/), a Rust-based static site generator. The project uses a [forked version of Zola](https://github.com/theowenyoung/zola) with one modification: internal links use `/content/xxx.md` instead of `@/xxx.md` so editors can navigate to linked files.

Live site: https://www.owenyoung.com

## Common Commands

```bash
make install      # Install dependencies (Zola binary)
make serve        # Local dev server on port 8000 (includes drafts)
make prod-serve   # Local server without drafts
make build        # Build static site
deno test         # Run tests
```

### Content Creation

```bash
make daily        # Generate daily content
make notes name=x # Create new note
make book name=x  # Create book entry
make random name=x # Generate random content
```

### Book/Epub Tools

```bash
make buildbook    # Build book with Deno
make servebook    # Serve book locally
```

## Architecture

- **Static site generator**: Zola (custom fork in `./bin/zola`)
- **Scripting runtime**: Deno (TypeScript)
- **Search**: Meilisearch (self-hosted)
- **Multilingual**: Chinese (default) and English (`*.en.md` files)

### Key Directories

- `/content/` - All content (blog posts, notes, quotes, etc.)
- `/templates/` - Zola templates and shortcodes
- `/static/` - Static assets
- `/scripts/` - Bash and Deno utility scripts
- `/book/` - Book/epub generation tools
- `/.github/workflows/` - CI/CD pipelines

### Content Organization

Content files follow the pattern:
- `index.md` - Chinese version (default)
- `index.en.md` - English version

Internal links should use `/content/path/to/file.md` format (not `@/path`).

## Configuration

- `config.toml` - Main Zola configuration (site settings, taxonomies, translations)
- `.env` - Environment variables (loaded by Makefile)
