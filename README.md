## Backend structure (summary)

When adding a resource, follow **migration → model → repository → service → DTO → controller → module**.

DTOs are **optional** and should only be added when explicitly required.

When DTOs are used, keep **one DTO file per entity**, with operation-specific DTO classes/types inside that file.

Details, validation, and npm scripts are in **[backend/README.md](backend/README.md)**.

## Frontend structure (summary)

The frontend uses **Vue 3 + Vite**.

When adding frontend functionality, keep the implementation **simple and easy to explain in an interview**.

Prefer a straightforward structure such as:

```text
frontend/src/
├── components/     # Reusable UI components
├── views/          # Page-level components
├── services/       # API calls when needed
├── assets/         # Static assets/styles
├── App.vue
└── main.ts
```

Use components only when they provide a clear benefit. Do not over-componentize simple UI.

Prefer:

* Simple Vue components
* `ref`, `reactive`, and `computed` for local state
* Straightforward API calls
* Simple HTML
* Simple CSS using flexbox/grid where appropriate

Avoid unnecessary frontend architecture, state-management libraries, UI frameworks, abstractions, or advanced CSS.

The frontend should prioritize **functionality, clarity, and explainability over visual polish**.

## Implementation plan

The implementation plan and current interview requirements should be documented in **`PLAN.md` or another relevant `.md` file in the repository**.

Before implementing a feature, check the relevant planning/documentation files and treat them as a source of truth for:

* Functional requirements
* API requirements
* Entities and relationships
* Frontend requirements
* Scope decisions
* Implementation decisions
* Explicit constraints

Do not invent additional requirements that are not present in the plan or explicitly requested by the user.

If the plan and the user's current instruction conflict, **the user's current instruction takes precedence**.

Keep the implementation aligned with the plan and update the plan only when explicitly asked.

## Cursor / AI

AI should act as an **implementation copilot**, not as a second interviewer.

The implementation should follow the requirements and decisions documented in `plan.md` or other relevant `.md` files in the repository.
