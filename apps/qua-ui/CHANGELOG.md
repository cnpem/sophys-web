# @sophys-web/qua-ui

## 0.5.1

### Patch Changes

- 27db97d: Refactor api routes to organize httpserver related routes under the httpserver namespace.
- Updated dependencies [f00f1f7]
- Updated dependencies [0697820]
- Updated dependencies [323687c]
- Updated dependencies [1c14816]
- Updated dependencies [27db97d]
- Updated dependencies [6526721]
- Updated dependencies [5c4d645]
  - @sophys-web/api@0.2.0
  - @sophys-web/ui@0.4.0
  - @sophys-web/api-client@0.3.0
  - @sophys-web/widgets@0.5.1

## 0.5.0

### Minor Changes

- 330abd0: - Updated dashboard layout with new running item with improved pause and abort controls.
  - Updated queue and history items with copy item functionality improved display of information.
  - Added queue stop queue item in the `+ Other` menu along with the search plan item.
  - Add regex for filenames at energy scan plans

### Patch Changes

- 8bf121b: Fix build error related to turbo global install in container
- bc9e450: Added ci for deploying pr versions with a set basePath for deployment to the same hostname with added "/pr<pr-number>" to the path for testing purposes.
- Updated dependencies [c6fb430]
- Updated dependencies [e9bfaf0]
- Updated dependencies [829966b]
  - @sophys-web/widgets@0.5.0
  - @sophys-web/api@0.1.3
  - @sophys-web/api-client@0.2.2

## 0.4.0

### Minor Changes

- 48e54ea: Add a "heat" plan form for Quati beamline and add shadcn chart component
- c2cb0f1: Add multiple experiment related PVs to the main dashboard, also change the Queue name to Experimental Procedures

## 0.3.0

### Minor Changes

- 6b9647e: Add potentiostat support for energy scan plans and create a uniform form
- 2002e24: Add fly-scanning plan with PVWS store and acceleration calculations

### Patch Changes

- Updated dependencies [b1f6dbc]
- Updated dependencies [b1f6dbc]
- Updated dependencies [b1f6dbc]
  - @sophys-web/widgets@0.3.0
  - @sophys-web/ui@0.2.0
  - @sophys-web/api@0.1.2
  - @sophys-web/api-client@0.2.1

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
