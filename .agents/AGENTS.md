# Engineering Bible Enforcement

Treat the `docs/engineering/` Engineering Bible as immutable. 

Before implementing any feature:
1. Identify the relevant document(s) in the Engineering Bible.
2. Produce an implementation plan artifact.
3. The plan must list:
   - Affected files
   - Risks
   - Database changes
   - API changes
   - Migration steps
   - Testing strategy

After implementation:
- Update the corresponding documentation so the Engineering Bible never drifts from the codebase.

Strict Constraints:
- Do not implement undocumented features.
- Do not deviate from the documented architecture without first proposing an ADR (Architecture Decision Record).
