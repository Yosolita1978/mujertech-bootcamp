# TODO

Track items that need attention before specific milestones. Remove or move to a more permanent location once handled.

---

## Pre-deploy

### StructuredData content needs rewrite

**File:** `src/components/StructuredData/StructuredData.tsx`

Schemas were ported verbatim from `mujertech-taller-nextjs` and describe **the intro workshop, not the bootcamp**:

- Hardcoded domain: `mujertech.org`, `intro.mujertech.org` (including the org logo URL).
- Hardcoded course details: `Taller Introductorio de IA para Emprendedoras`, 45-minute duration (`PT45M`), beginner level, intro-workshop description and `teaches` list.
- Single-locale: every schema sets `inLanguage: 'es'`.

Before this site ships:

- [ ] Replace all `mujertech.org` / `intro.mujertech.org` URLs with the bootcamp's production domain.
- [ ] Rewrite `courseSchema` (`name`, `description`, `teaches`, `timeRequired`, `educationalLevel`) to describe the bootcamp curriculum, not the intro workshop.
- [ ] Decide locale strategy: keep `inLanguage: 'es'` (single-locale schema), or emit per-locale schemas via `generateMetadata` in the `[locale]` layout.
- [ ] Confirm the organization schema (`MujerTech` + `sameAs` social links) is still correct for this site.

### Module1 WhatsApp share — hardcoded Spanish wrapper

**File:** `src/components/modules/Module1/Module1.tsx` (`handleWhatsAppShare`)

The share message wraps the i18n'd `t('ethics.shareText')` with Spanish prose ("💬 Pregunta del taller MujerTech:", "¿Qué opinan ustedes?") that is **not localized**. EN-locale users will get a mixed-language share message. Faithful port from source.

- [ ] Add `module1.ethics.shareIntro` and `module1.ethics.shareOutro` to both `messages/es.json` and `messages/en.json`
- [ ] Reassemble the WhatsApp message from the three i18n strings
- [ ] Check `Module2` and `Capstone` for the same hardcoded-wrapper pattern when porting them; apply the same fix

### Module2 Spanish-only lookup tables (`NEED_TEXTS` / `TONE_TEXTS`)

**File:** `src/components/modules/Module2/Module2.tsx` (`NEED_TEXTS`, `TONE_TEXTS` constants)

Two `Record<NeedId|ToneId, string>` lookup dicts hold Spanish-only prose appended into the generated prompt:
- `NEED_TEXTS.social` = `'3 ideas de publicaciones para mis redes sociales'`, etc.
- `TONE_TEXTS.amigable` = `'amigable y cercano, como si le hablara a una amiga'`, etc.

These don't go through i18n, so EN-locale users still get a Spanish prompt to paste into ChatGPT.

- [ ] Move each value into `messages/{es,en}.json` (e.g., `module2.yourTurn.needs.socialText`, `module2.yourTurn.tones.amigableText`)
- [ ] Replace lookup dict reads in `handleGeneratePrompt` with `t(...)` calls

### Module2 prompt template — Spanish wrapper in `handleGeneratePrompt`

**File:** `src/components/modules/Module2/Module2.tsx` (`handleGeneratePrompt`)

The template literal builds the prompt with hardcoded Spanish prose around the dynamic values: `"Tengo un negocio de ${business}. Necesito ${...}. Usa un tono ${...}."`

- [ ] Add a `module2.yourTurn.promptTemplate` i18n key with ICU placeholders (`{business}`, `{need}`, `{tone}`)
- [ ] Replace the template literal with `t('yourTurn.promptTemplate', { business, need, tone })`
- [ ] Coordinate with the `NEED_TEXTS`/`TONE_TEXTS` migration above so `need` and `tone` are already localized

### Module2 tool steps — hardcoded Spanish + anchor JSX

**File:** `src/components/modules/Module2/Module2.tsx` (ChatGPT and Canva tool cards, step 1 of each `<ol>`)

Step 1 of each tool card is hardcoded inline JSX: `<li>Entra a <strong><a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">chatgpt.com</a></strong></li>` (and same pattern for Canva). EN-locale users get a mixed-language instruction.

- [ ] Convert to `t.rich('tools.chatgpt.step1', { link: (chunks) => <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">{chunks}</a> })`
- [ ] Add `module2.tools.chatgpt.step1` / `module2.tools.canva.step1` keys with `<link>chatgpt.com</link>` tag markup
- [ ] Verify the rendered anchor preserves `target="_blank" rel="noopener noreferrer"`

### Capstone quiz "Comprobar" buttons — hardcoded Spanish

**File:** `src/components/modules/Capstone/Capstone.tsx` (three `btnCheck` buttons in step 8)

Each quiz card's submit button renders the literal `Comprobar` string inline instead of going through i18n. EN-locale users will see Spanish "Comprobar." Faithful port from source — no `capstone.checkButton` key exists yet in either locale file.

- [ ] Add `capstone.checkButton` to both `messages/es.json` (`"Comprobar"`) and `messages/en.json` (`"Check"`)
- [ ] Replace all three `>Comprobar</button>` occurrences with `>{t('checkButton')}</button>`

---

## Pre-Next-16 upgrade

### Migrate from `next lint` to ESLint CLI

**File:** `package.json` (`scripts.lint`)

`next lint` is deprecated in Next 15 and will be **removed** in Next 16. The deprecation notice prints on every `npm run lint`.

- [ ] Run the codemod: `npx @next/codemod@canary next-lint-to-eslint-cli .`
- [ ] Update `package.json`'s `lint` script to call `eslint` directly (e.g., `eslint .`)
- [ ] Verify `eslint.config.mjs` still resolves `next/core-web-vitals` and `next/typescript` correctly under direct invocation
- [ ] Verify CI (if any) still picks up the same set of files
