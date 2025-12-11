# @sophys-web/qua-ui

## 0.2.0

### Minor Changes

- 54d56ca: Add regions validations to calculate minimum requires steps (15 required by HW), also refactor region validation in a forEach.
  Add validations of minimum initial energy/K regions based on previous region, also convert E to K
- 04df02e: Add Timed Region Energy Scan form. The main difference of these plans are:

  - No up-down logic;
  - No fly-data enabled;
  - 1 acquistion time per-region;

  A new dropdown menu was added grouping all energy scans into a single dropdown, since in the future there will be at least 5 different scans

### Patch Changes

- d4d6a07: Update Next.js and React version in pnpm workspace and package template.

  Following recommendations from: https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components and https://nextjs.org/blog/CVE-2025-66478

- 66e2a0f: Fix initial region final energy validation with edge energy
- 037d715: Created a controls widget component to manage environment, queue and run engine.
  Added the ability to destroy environments via the use-status hook in the api-client package.
  Added the ability to destroy environments in the controls widget in the widgets package.
  Updated the qua-ui and spu-ui packages to use the new controls widget.

  Added the button-group component set to the ui package.
  Added the spinner component to the ui package.
  Updated the ui package's alert-dialog component set based on the latest changes from shadcn/ui.

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

## 0.1.3

### Patch Changes

- 3768b34: Fixed value handling on field array updates for adding a new field and changing field space in the region energy scan form.
- 029222d: Adds a change on RE router pause procedure to allow the input of a per-defined body to allow full control of pause state of RE. Also add a new logic of control to QUA app to enhance UX when pausing plans.

## 0.1.2

### Patch Changes

- a1b2546: Added FinishedItemAlertDialog component with sound notification to alert users when a plan finishes and the queue stops.

## 0.1.1

### Patch Changes

- refactor: update region energy scan form to estimate time based on form values
