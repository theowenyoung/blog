// read from
import * as fs from "https://deno.land/std@0.159.0/fs/mod.ts";
import { extract } from "https://deno.land/std@0.159.0/encoding/front_matter.ts";
import * as path from "https://deno.land/std@0.159.0/path/mod.ts";
import { stringify } from "https://deno.land/std@0.159.0/encoding/toml.ts";
interface Chapter {
  relativePath: string;
  path: string;
  title: string;
  date: Date;
  category: string;
  content: string;
}
interface BookConfig {
  book: Record<string, unknown>;
  output: {
    epub: Record<string, unknown>;
    html: Record<string, unknown>;
    markdown?: Record<string, unknown>;
  };
}

interface Book {
  chapters: Chapter[];
  config: BookConfig;
  tags: string[];
}

async function main() {
  // walk content directory
  const markdownSourcePath = "./content";
  const bookDist = "./book-dist";
  const outputOptions = {
    epub: {
      "cover-image": "cover.jpg",
    },
    html: {
      "git-repository-url": "https://github.com/theowenyoung/blog",
      "edit-url-template":
        "https://github.com/theowenyoung/blog/edit/main/{path}",
    },
    markdown: {
      enable: true,
    },
  };

  const books: Record<string, Book> = {
    "random": {
      chapters: [],
      tags: ["Random Book"],
      config: {
        book: {
          "title": "Random",
          "description": "Random",
          "src": "content",
          "language": "zh",
          "authors": ["Owen Young"],
        },
        output: outputOptions,
      },
    },
  };
  // clear current book dist
  await Deno.remove(bookDist, { recursive: true });

  const booksKeys = Object.keys(books);
  // build tags map for match books
  const tagsMap: Record<string, string[]> = {};
  for (const bookKey of booksKeys) {
    const book = books[bookKey];
    for (const tag of book.tags) {
      if (!tagsMap[tag]) {
        tagsMap[tag] = [];
      }
      if (!tagsMap[tag].includes(bookKey)) {
        tagsMap[tag].push(bookKey);
      }
    }
  }

  for await (const entry of fs.walk(markdownSourcePath)) {
    if (entry.isFile) {
      const filepath = entry.path;
      const filename = path.basename(filepath);
      const ext = path.extname(filepath);
      if (
        ext === ".md" && !filename.endsWith(".en.md") &&
        filename !== "_index.md"
      ) {
        // read file
        const file = await Deno.readTextFile(entry.path);
        // extract front matter
        const parsed = extract(file);
        const { body } = parsed;
        const attrs = parsed.attrs as {
          title: string;
          date: string;
          taxonomies: {
            tags?: string[];
            categories: string[];
          };
        };
        const taxonomies = attrs.taxonomies;
        const tags = taxonomies?.tags || [];
        const categories = taxonomies?.categories;
        const category = categories?.[0];

        for (const tag of tags) {
          if (tagsMap[tag] && tagsMap[tag].length > 0) {
            for (const bookKey of tagsMap[tag]) {
              const relativePath = path.relative(markdownSourcePath, filepath);
              books[bookKey].chapters.push({
                path: filepath,
                relativePath,
                title: attrs.title,
                date: new Date(attrs.date),
                category,
                content: body,
              });
            }
          }
        }
      }
    }
  }
  for (const key of booksKeys) {
    const book = books[key];
    const bookConfig = book.config;
    const bookSourceFileDist = path.join(bookDist, key);

    const chapters = book.chapters;
    // sort by date
    chapters.sort((a, b) => b.date.getTime() - a.date.getTime());
    // write to file
    let summary = `# Summary\n\n`;
    for (const chapter of chapters) {
      // console.log(chapter.path);
      const distPath = path.join(
        bookSourceFileDist,
        bookConfig.book.src as string,
        chapter.relativePath,
      );
      const markdownContent = `# ${chapter.title}\n\n${chapter.content}`;
      // ensure folder exists
      await fs.ensureDir(path.dirname(distPath));
      await Deno.writeTextFile(distPath, markdownContent);
      // if chapter is a folder, also copy assets
      if (chapter.path.endsWith("index.md")) {
        const folder = path.dirname(chapter.path);
        const assets = fs.walk(folder);
        for await (const asset of assets) {
          if (asset.isFile && path.basename(asset.path) !== "index.md") {
            const assetRelativePath = path.join(
              path.dirname(chapter.relativePath),
              path.relative(folder, asset.path),
            );
            const assetDistPath = path.join(
              bookSourceFileDist,
              bookConfig.book.src as string,
              assetRelativePath,
            );
            await fs.ensureDir(path.dirname(assetDistPath));
            await Deno.copyFile(asset.path, assetDistPath);
          }
        }
      }
      summary += `- [${chapter.title}](${chapter.relativePath})\n`;
    }
    // write summary
    await Deno.writeTextFile(
      path.join(
        bookSourceFileDist,
        bookConfig.book.src as string,
        "SUMMARY.md",
      ),
      summary,
    );

    // copy book assets
    const bookAssetsPath = path.join("book", key);

    for await (const asset of fs.walk(bookAssetsPath)) {
      if (asset.isFile) {
        const assetRelativePath = path.relative(bookAssetsPath, asset.path);
        const assetDistPath = path.join(
          bookSourceFileDist,
          bookConfig.book.src as string,
          assetRelativePath,
        );
        await fs.ensureDir(path.dirname(assetDistPath));
        await Deno.copyFile(asset.path, assetDistPath);
      }
    }
    // write book.toml
    const bookToml = stringify(
      book.config as unknown as Record<string, unknown>,
    );
    const bookTomlPath = path.join(bookSourceFileDist, "book.toml");
    await Deno.writeTextFile(bookTomlPath, bookToml);
    console.log(`build book ${key} source files success`);
    const p = Deno.run({
      cmd: ["bin/mdbook-epub", "--standalone", bookSourceFileDist],
    });
    await p.status();
    console.log(
      `build book ${key} epub ${bookSourceFileDist}/book/epub/${book.config.book.title}.epub success`,
    );
  }
}

if (import.meta.main) {
  await main();
}
