# @sophys-web/spu-ui

## 0.2.0

### Minor Changes

- cc532ee: Refactor load sample form to select volume from a list of possible choices.
- 893acc8: Add option to submit the complete acquisition plan on demand (without custom cleaning options).
- 01e180f: Add standard cleaning form to on demand items.
- 99ebb81: stop adding queue_stop task automatically in "on demand" plans and sumbit them to the end of the queue (default behavior).

### Patch Changes

- d4d6a07: Update Next.js and React version in pnpm workspace and package template.

  Following recommendations from: https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components and https://nextjs.org/blog/CVE-2025-66478

- 48dcee1: Remove requirement for buffer tag in plan forms and derived components.
- 2f592c3: Clear and disable bufferTag field if sampleType is buffer.
- 0587696: Added component for detailed view for history items.
- cc532ee: Display sample info in sample form and fix styling.
- 1e7a584: Refactor capillary state, removing "unknown" state, defaulting to "stale".
- 6244869: Change sample item styles in tray to match style for loaded sample in capilarry state.
- 037d715: Created a controls widget component to manage environment, queue and run engine.
  Added the ability to destroy environments via the use-status hook in the api-client package.
  Added the ability to destroy environments in the controls widget in the widgets package.
  Updated the qua-ui and spu-ui packages to use the new controls widget.

  Added the button-group component set to the ui package.
  Added the spinner component to the ui package.
  Updated the ui package's alert-dialog component set based on the latest changes from shadcn/ui.

- ae7f07a: Fix tray cleanup action and standardize sample type parameter across components.
- Updated dependencies [fddcd55]
- Updated dependencies [2fcfc27]
- Updated dependencies [bcea9c8]
- Updated dependencies [b28483e]
- Updated dependencies [18687a4]
- Updated dependencies [037d715]
  - @sophys-web/api@0.1.1
  - @sophys-web/widgets@0.2.0
  - @sophys-web/ui@0.1.1
  - @sophys-web/api-client@0.2.0

## 0.1.1

### Patch Changes

- 5d19a9d: Changed pvws-store connection handler to get its url from props so a parent server component can load its value from the runtime environment (instead of relying on NEXT* PUBLIC* environment variables that need to be set at build time).

- 6bbac35: fixed (packages/pvws-store): use "clear" action on unsubscribe messages

## 0.1.0

### Minor Changes

- 1c81728: Updated plans schemas to be compatible to recent changes, created widget for rendering a generic form based on the plan annotations, added a download link for an example CSV file in the UploadQueue component.

- Initial changeset

### Patch Changes

- Updated dependencies
  - @sophys-web/auth@0.1.0
  - @sophys-web/api@0.1.0
  - @sophys-web/ui@0.1.0
