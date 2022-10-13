// read from
import * as fs from "https://deno.land/std@0.159.0/fs/mod.ts";
import { extract } from "https://deno.land/std@0.159.0/encoding/front_matter.ts";
import * as path from "https://deno.land/std@0.159.0/path/mod.ts";
import * as posixPath from "https://deno.land/std@0.159.0/path/posix.ts";
import { stringify } from "https://deno.land/std@0.159.0/encoding/toml.ts";
import { gfm } from "https://esm.sh/micromark-extension-gfm@2.0.1";
import {
  gfmFromMarkdown,
  gfmToMarkdown,
} from "https://esm.sh/mdast-util-gfm@2.0.1";
// import { default as kebabCase } from "https://jspm.dev/lodash@4.17.21/kebabCase";
import { toMarkdown } from "https://esm.sh/mdast-util-to-markdown@1.3.0";
import { fromMarkdown } from "https://esm.sh/mdast-util-from-markdown@1.2.0";
import { visit } from "https://esm.sh/unist-util-visit@4.1.1";

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
    pdf?: Record<string, unknown>;
    latex?: Record<string, unknown>;
  };
}
interface SubSection {
  title: string;
  path: string;
}
interface SummarySection {
  title: string;
  path: string;
  rules?: Rule[];
  subSections?: SubSection[];
}
interface Rule {
  condition: string;
  key: string;
  value: string;
}
interface Book {
  tags: string[];
  config: BookConfig;
  introduction: SummarySection;
  summary: SummarySection[];
  chapters: Chapter[];
}

const markdownSourcePath = "./content";
const markdownRootPath = "./";
const bookDist = "./book-dist";
const host = "https://www.owenyoung.com";
async function main() {
  const args = Deno.args;
  const workDir = new URL("..", import.meta.url).pathname;
  const binDir = new URL("../bin", import.meta.url).pathname;
  console.log("binDir", binDir);
  const isServe = args.includes("--serve");
  // walk content directory
  const outputOptions = {
    epub: {
      "cover-image": "cover.jpg",
      "command": binDir + "/mdbook-epub",
    },
    html: {
      "git-repository-url": "https://github.com/theowenyoung/blog",
      "edit-url-template":
        "https://github.com/theowenyoung/blog/edit/main/{path}",
      "search": {
        "enable": false,
      },
    },
    markdown: {
      enable: false,
    },
    pdf: {
      enable: true,
      "command": binDir + "/mdbook-pdf",
    },
  };

  const books: Record<string, Book> = {
    "owen-blog": {
      tags: ["Random Book"],
      chapters: [],
      introduction: {
        title: "简介",
        path: "README.md",
      },
      summary: [
        {
          title: "随笔",
          path: "random-intro.md",
          rules: [
            {
              condition: "contains",
              key: "category",
              value: "Random",
            },
          ],
        },
        {
          title: "短想法",
          path: "thoughts.md",
        },
        {
          title: "笔记",
          path: "notes-intro.md",
          rules: [
            {
              condition: "contains",
              key: "category",
              value: "Notes",
            },
            {
              condition: "notContains",
              key: "relativePath",
              value: "content/thoughts.md",
            },
            {
              condition: "notContains",
              key: "relativePath",
              value: "content/pages/now.md",
            },
            {
              condition: "notContains",
              key: "relativePath",
              value: "content/pages/about.md",
            },
          ],
        },
        {
          title: "读书笔记",
          path: "books-intro.md",
          rules: [
            {
              condition: "contains",
              key: "category",
              value: "Books",
            },
          ],
        },
        {
          title: "文章笔记",
          path: "articles-intro.md",
          rules: [
            {
              condition: "contains",
              key: "category",
              value: "Articles",
            },
          ],
        },
        {
          title: "关于我",
          path: "pages/about.md",
          subSections: [
            {
              title: "现在",
              path: "pages/now.md",
            },
          ],
        },
      ],
      config: {
        book: {
          "title": "Owen博客精选",
          "description": "Owen的博客电子书版",
          "src": "content",
          "language": "zh",
          "authors": ["Owen Young"],
        },
        output: outputOptions,
      },
    },
  };
  // clear current book dist
  try {
    await Deno.remove(bookDist, { recursive: true });
  } catch (_e) {
    // ignore
  }
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

  for await (
    const entry of fs.walk(markdownSourcePath, {
      includeDirs: false,
    })
  ) {
    if (entry.isFile && !entry.name.startsWith(".")) {
      const filepath = entry.path;
      const filename = path.basename(filepath);
      const ext = path.extname(filepath);
      if (
        ext === ".md" && !filename.startsWith("_")
      ) {
        let fileLanguage = "zh";

        const filenameParts = filename.split(".");
        if (filenameParts.length > 2) {
          fileLanguage = filenameParts[filenameParts.length - 2];
        }

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
              const bookConfig = books[bookKey].config;
              const expectedLanguage = bookConfig.book.language;
              if (expectedLanguage === fileLanguage) {
                const relativePath = path.relative(markdownRootPath, filepath);
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
  }
  for (const key of booksKeys) {
    const book = books[key];
    const bookConfig = book.config;
    const bookSourceFileDist = path.join(bookDist, key);

    const chapters = book.chapters;
    // sort by date
    chapters.sort((a, b) => b.date.getTime() - a.date.getTime());
    // write to file
    const targetMarkdownFiles: Record<string, string> = {};
    const allFiles: string[] = [];
    for (const chapter of chapters) {
      // console.log(chapter.path);
      const markdownContent = `# ${chapter.title}\n\n${chapter.content}`;
      targetMarkdownFiles[chapter.relativePath] = markdownContent;
      if (!allFiles.includes(chapter.relativePath)) {
        allFiles.push(chapter.relativePath);
      }
      // if chapter is a folder, also copy assets
      if (/index.(\w+\.)?md$/.test(chapter.path)) {
        const folder = path.dirname(chapter.path);
        const assets = fs.walk(folder, { includeDirs: false });
        for await (const asset of assets) {
          if (
            asset.isFile && !asset.path.endsWith(".md") &&
            !asset.path.startsWith(".")
          ) {
            const assetRelativePath = path.relative(
              markdownRootPath,
              asset.path,
            );
            const assetDistPath = path.join(
              bookSourceFileDist,
              assetRelativePath,
            );
            await fs.ensureDir(path.dirname(assetDistPath));
            await Deno.copyFile(asset.path, assetDistPath);
          }
        }
      }
    }

    // format markdown and write to dist
    for (const relativePath of Object.keys(targetMarkdownFiles)) {
      const distPath = path.join(
        bookSourceFileDist,
        relativePath,
      );
      // ensure folder exists
      const markdownContent = targetMarkdownFiles[relativePath];
      const formatted = formatMarkdown(relativePath, markdownContent, allFiles);
      await fs.ensureDir(path.dirname(distPath));
      await Deno.writeTextFile(distPath, formatted);
    }

    // gen summary

    for (const chapter of chapters) {
      for (const summarySection of book.summary) {
        const rules = summarySection.rules;
        if (rules) {
          let match = true;
          for (const rule of rules) {
            const actualValue =
              (chapter as unknown as Record<string, string>)[rule.key];
            if (rule.condition === "contains") {
              if (
                Array.isArray(actualValue) && !actualValue.includes(rule.value)
              ) {
                match = false;
              } else if (actualValue !== rule.value) {
                match = false;
              }
            }

            // notContains
            if (rule.condition === "notContains") {
              if (
                Array.isArray(actualValue) && actualValue.includes(rule.value)
              ) {
                match = false;
              } else if (actualValue === rule.value) {
                match = false;
              }
            }
          }
          if (match) {
            const relativePathToSummary = chapter.relativePath.replace(
              /^content\//,
              "",
            );
            if (!summarySection.subSections) {
              summarySection.subSections = [];
            }
            summarySection.subSections.push({
              title: chapter.title,
              path: relativePathToSummary,
            });
          }
        }
      }
    }

    let summary = `# Summary\n\n`;
    summary += `[${book.introduction.title}](${book.introduction.path})\n\n`;
    for (const section of book.summary) {
      summary += `- [${section.title}](${section.path})\n`;

      if (section.subSections) {
        for (const subSection of section.subSections) {
          summary += `  - [${subSection.title}](${subSection.path})\n`;
        }
      }
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

    for await (
      const asset of fs.walk(bookAssetsPath, {
        includeDirs: false,
      })
    ) {
      if (asset.isFile && !asset.path.startsWith(".")) {
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
      cmd: ["./bin/mdbook", isServe ? "serve" : "build", bookSourceFileDist],
    });
    await p.status();

    // copy epub file
    const epubPath = path.join(
      bookSourceFileDist,
      `book/epub/${book.config.book.title}.epub`,
    );
    await fs.ensureDir(path.join(workDir, "dist"));
    const distDir = path.join(workDir, "dist");
    const epubNewPath = path.join(distDir, `${key}.epub`);
    await Deno.copyFile(epubPath, epubNewPath);

    // copy pdf file
    const pdfPath = path.join(bookSourceFileDist, "book/pdf/output.pdf");
    const pdfDistPath = path.join(distDir, `${key}.pdf`);
    await Deno.copyFile(pdfPath, pdfDistPath);

    // zip html files to dist
    const htmlPath = path.join(bookSourceFileDist, "book/html");
    const zipProcess = Deno.run({
      cmd: [
        "zip",
        "-r",
        "-q",
        path.join(workDir, "dist", `${key}-html.zip`),
        "./",
      ],
      cwd: htmlPath,
    });
    await zipProcess.status();
    console.log("build book success");
  }
}

if (import.meta.main) {
  await main();
}

function formatMarkdown(filepath: string, content: string, allFiles: string[]) {
  const tree = fromMarkdown(content, "utf8", {
    extensions: [gfm()],
    mdastExtensions: [gfmFromMarkdown()],
  });
  visit(tree, "link", (node) => {
    const { url } = node;
    if (
      url && url.startsWith("/content/") &&
      url.endsWith(".md")
    ) {
      // if url ends with _index.md or _index.en.md, transform to absolute url
      const basename = path.basename(url);
      if (/_index\.(\w+\.)?md/.test(basename)) {
        const finalUrl = internalMarkdownLinkToAbsoluteUrl(url);
        // remove _index.md
        node.url = finalUrl;
      } else {
        // replace to relative html link
        // get relative path
        // transform to absolute path
        // remove /content
        const targetPathWithoutRoot = url.replace(/^\/content/, "content");
        if (allFiles.includes(targetPathWithoutRoot)) {
          const relativePath = path.relative(
            path.dirname(path.join("/", filepath)),
            url,
          );
          const finalUrl = relativePath.replace(/\.md$/, ".html");
          node.url = finalUrl;
        } else {
          // do not include, transform to absolute url
          const finalUrl = internalMarkdownLinkToAbsoluteUrl(url);
          node.url = finalUrl;
        }
      }
    }
  });

  const markdownDist = toMarkdown(tree, {
    extensions: [gfmToMarkdown()],
  });
  return markdownDist;
}

function internalMarkdownLinkToAbsoluteUrl(link: string): string {
  const basename = path.basename(link);
  let langPath = "";
  const basenameArr = basename.split(".");
  const relativePath = posixPath.relative("/content", link);

  let filenameWithoutExt = basenameArr.slice(0, -1).join();
  if (basenameArr.length > 2) {
    // yse lang
    langPath = basenameArr[basenameArr.length - 2] + "/";
    filenameWithoutExt = basenameArr.slice(0, -2).join();
  }
  let finalUrl = "";
  if (filenameWithoutExt === "_index" || filenameWithoutExt === "index") {
    // section
    finalUrl = `${host}/${langPath}${posixPath.dirname(relativePath)}/`;
  } else {
    finalUrl = `${host}/${langPath}${
      posixPath.dirname(relativePath)
    }/${filenameWithoutExt}/`;
  }
  return finalUrl;
}
