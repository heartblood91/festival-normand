# @cedric-freret/maker-credit

Discreet "site built by" line for a site footer. React only, inline styles, no
CSS framework, so it drops into any React/Next.js project.

Lives inside Pierres en Lumières for now. To reuse it elsewhere (4A l'escale,
Résidence du verger…), publish this folder as a private package, adding a build
step (`tsc` to `dist/`) if the consumer does not transpile TypeScript from
`node_modules`.

## Usage

```tsx
import { MakerCredit } from "@cedric-freret/maker-credit"
;<MakerCredit
  name="Cédric Freret"
  url="https://cedric-freret.fr/"
  role="lead dev bénévole — Délégation Normandie"
  links={[{ label: "LinkedIn", href: "https://www.linkedin.com/in/cedric-freret" }]}
  theme="dark" // "light" or { text: "#…", accent: "#…" }
  prefix="Site développé par" // e.g. "Site built by" on English pages
/>
```

| Prop        | Type                                      | Default                |
| ----------- | ----------------------------------------- | ---------------------- |
| `name`      | `string`                                  | required               |
| `url`       | `string` (http/https), linked on the name | —                      |
| `role`      | `string`                                  | —                      |
| `links`     | `{ label, href }[]` (http/https only)     | `[]`                   |
| `prefix`    | `string`                                  | `"Site développé par"` |
| `theme`     | `"dark" \| "light" \| { text, accent }`   | `"dark"`               |
| `className` | `string`                                  | —                      |

Links that are not plain http(s) URLs are dropped. Tests:
`pnpm vitest run packages/maker-credit`.
