import { Project, SyntaxKind } from "ts-morph";
import * as path from "path";
import * as fs from "fs";
import { fileURLToPath } from "url";

// support ESM (__dirname not defined) by deriving from import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const COMPONENT_PATH = path.join(ROOT, "src", "components", "ScaledCanvas.tsx");

// safety: require git clean workspace (user check)
console.log(
  "Make sure your repo is clean/committed. Creating backups (.bak) for modified files."
);

// init project
const project = new Project({
  tsConfigFilePath: path.join(ROOT, "tsconfig.json"),
  skipAddingFilesFromTsConfig: true,
});

// add files to project (tsx/ts inside src)
project.addSourceFilesAtPaths(path.join(ROOT, "src", "**", "*.{ts,tsx}"));

const files = project.getSourceFiles().filter((f) => {
  const p = f.getFilePath();
  if (p.includes("node_modules") || p.includes(".next") || p.includes("dist"))
    return false;
  if (p === COMPONENT_PATH) return false;
  return true;
});

function makeRelativeImport(from: string, to: string) {
  let rel = path.relative(path.dirname(from), to).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = "./" + rel;
  // remove extension
  rel = rel.replace(/\.(tsx|ts)$/, "");
  return rel;
}

for (const sf of files) {
  const filePath = sf.getFilePath();
  const text = sf.getFullText();

  // quick skip if no JSX tokens
  if (!/<[A-Za-z]/.test(text)) continue;

  // skip if already imports ScaledCanvas from somewhere
  if (/from ['"].*ScaledCanvas['"]/.test(text)) continue;

  let modified = false;
  const relativeImport = makeRelativeImport(filePath, COMPONENT_PATH);

  // 1) add import at top
  sf.insertStatements(0, `import ScaledCanvas from "${relativeImport}";`);

  // 2) find default export declarations and wrap their return JSX
  const defaultExportSymbol = sf.getDefaultExportSymbol();
  if (!defaultExportSymbol) {
    // try to find exported assignment (skip complex cases)
    const exportAssign = sf.getFirstDescendant(
      (node) => node.getKind() === SyntaxKind.ExportAssignment
    );
    if (exportAssign) {
      // no-op for now
    }
  } else {
    const decls = defaultExportSymbol.getDeclarations();
    for (const d of decls) {
      const fn =
        d.asKind(SyntaxKind.FunctionDeclaration) ||
        d.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
      if (!fn) continue;

      // safer: replace the return *expression* (not the whole statement).
      // collect expression nodes first, then replace them.
      const returnNodes = fn.getDescendantsOfKind(SyntaxKind.ReturnStatement);
      const exprNodes: { exprNode: any; text: string }[] = [];
      for (const r of returnNodes) {
        const expr = r.getExpression();
        if (!expr) continue;
        const exprText = expr.getText();
        if (/^\s*([(<]|\<)/.test(exprText)) {
          exprNodes.push({ exprNode: expr, text: exprText });
        }
      }
      for (const entry of exprNodes) {
        try {
          // replace only the expression node to avoid removing/forgetting parent nodes
          entry.exprNode.replaceWithText(
            `<ScaledCanvas>${entry.text}</ScaledCanvas>`
          );
          modified = true;
        } catch (err) {
          console.warn(
            `wrap-with-scaled-canvas: failed to replace return expression in ${filePath}`,
            err
          );
        }
      }

      // handle arrow function with expression body: const X = () => (<JSX/>)
      if (fn.getKind() === SyntaxKind.VariableDeclaration) {
        const init = (fn as any).getInitializer && (fn as any).getInitializer();
        if (
          init &&
          init.getKind &&
          init.getKind() === SyntaxKind.ArrowFunction
        ) {
          const body = init.getBody();
          if (
            body &&
            (body.getKind() === SyntaxKind.JsxElement ||
              body.getKind() === SyntaxKind.JsxSelfClosingElement ||
              body.getKind() === SyntaxKind.JsxFragment)
          ) {
            // capture text then replace (avoids touching nodes that may be stale)
            const bodyText = body.getText();
            try {
              body.replaceWithText(`<ScaledCanvas>${bodyText}</ScaledCanvas>`);
              modified = true;
            } catch (err) {
              console.warn(
                `wrap-with-scaled-canvas: failed to replace arrow-body JSX in ${filePath}`,
                err
              );
            }
          } else {
            // if block, handled by return replacement above
          }
        }
      }
    }
  }

  if (modified) {
    // backup original
    const bakPath = filePath + ".bak";
    if (!fs.existsSync(bakPath)) fs.writeFileSync(bakPath, text, "utf8");
    sf.saveSync();
    console.log("Modified:", filePath);
  } else {
    // if only import added but no wrap, remove import to avoid unused import
    const contentAfter = sf.getFullText();
    // if the file doesn't actually use ScaledCanvas, remove the import we added
    if (
      !/ScaledCanvas/.test(contentAfter) ||
      !/return\s*\(.*ScaledCanvas/.test(contentAfter)
    ) {
      const importDecl = sf
        .getImportDeclarations()
        .find(
          (d) =>
            d.getModuleSpecifierValue().includes("ScaledCanvas") ||
            d.getText().includes("ScaledCanvas")
        );
      if (importDecl) {
        // safer call to avoid TS complaints on some ts-morph versions
        (importDecl as any).remove?.();
      }
    }
  }
}

// save all (redundant but safe)
project.saveSync();
console.log(
  "Done. Review git diff, tests, and remove .bak files when satisfied."
);
