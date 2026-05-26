# TODO

Track items that need attention before specific milestones. Remove or move to a more permanent location once handled.

---

## Pre-deploy

### StructuredData — locale strategy + org-schema confirmation

**File:** `src/components/StructuredData/StructuredData.tsx`

The bootcamp courses, program description, and domain (`bootcamp.mujertech.org`) have been rewritten. Two items remain before ship:

- [ ] Decide locale strategy: keep `inLanguage: 'es'` (single-locale schema, currently hardcoded at `StructuredData.tsx:30` and `:84`), or emit per-locale schemas via `generateMetadata` in the `[locale]` layout.
- [ ] Confirm the organization schema (`MujerTech` + `sameAs` social links at `StructuredData.tsx:13-16`) is still correct for this site.

---

## Pre-Next-16 upgrade

### Migrate from `next lint` to ESLint CLI

**File:** `package.json` (`scripts.lint`)

`next lint` is deprecated in Next 15 and will be **removed** in Next 16. The deprecation notice prints on every `npm run lint`.

- [ ] Run the codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`
- [ ] Update `package.json`'s `lint` script to call `eslint` directly (e.g., `eslint .`)
- [ ] Verify `eslint.config.mjs` still resolves `next/core-web-vitals` and `next/typescript` correctly under direct invocation
- [ ] Verify CI (if any) still picks up the same set of files
