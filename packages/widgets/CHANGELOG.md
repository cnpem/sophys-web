# @sophys-web/widgets

## 0.4.1

### Patch Changes

- 9a48ca7: Docs: add import statements to the control bar examples.
- 9ec4be0: Add basic usage docs in README.

## 0.4.0

### Minor Changes

- edf1991: Added CancelRunningItemButton and EmergencyStopButton components for single click pause-and-stop actions.
- 088ff3f: Export columnHelper creator and add docs on how to customize and extend queue and history table columns.
- 320226d: Add a combined pause and pause immediate actions in the same pause button that triggers the "immediate" action if there is a pause action already scheduled (i.e. second click).
- 3e04678: Created independent composable components based on the former Controls widget providing independent and customizable control bar, environment, queue and run engine controls.

- Deprecated the former Controls widget block. Its original composition is available in the new ControlBar component docs.

- 09b5927: Set proposal field with login data in generic form (used for editing or generatign forms for any plan).
- 2499079: Updated schema generation for generic forms for checking if the field is optional by looking for a default value in the plan parameter annotation.

### Patch Changes

- 35c1222: Fixed schema generation to generate optional fields based also on the existence of a default value.

## 0.3.0

### Minor Changes

- b1f6dbc: Creating a compact queue widget for interacting with queue and history with more features and state feedback for manipulate and visualize items.

### Patch Changes

- Updated dependencies [b1f6dbc]
- Updated dependencies [b1f6dbc]
  - @sophys-web/ui@0.2.0
  - @sophys-web/api@0.1.2
  - @sophys-web/api-client@0.2.1

## 0.2.0

### Minor Changes

- b28483e: Add text input confirmation to enable the environment destroy action.
- 037d715: Created a controls widget component to manage environment, queue and run engine.
  Added the ability to destroy environments via the use-status hook in the api-client package.
  Added the ability to destroy environments in the controls widget in the widgets package.
  Updated the qua-ui and spu-ui packages to use the new controls widget.

  Added the button-group component set to the ui package.
  Added the spinner component to the ui package.
  Updated the ui package's alert-dialog component set based on the latest changes from shadcn/ui.

### Patch Changes

- 2fcfc27: Refactor (RE) stop messages to be more descriptive, referring to the resulting states and actions available to the user instead of just the name of the httpserver endpoint.
- bcea9c8: Improve pause icons by using a pair of icons in each button (pause + clock with exclamation mark for "pause now" and pause + milestone for "pause in the next checkpoint").
  Change pause pending state to never block the "pause now" button, allowing users to pause immediately even if a pause is already scheduled. Also add a pulsating animation to the buttons and tooltip message to indicate that a pause is already scheduled.
- Updated dependencies [fddcd55]
- Updated dependencies [18687a4]
- Updated dependencies [037d715]
  - @sophys-web/api@0.1.1
  - @sophys-web/ui@0.1.1
  - @sophys-web/api-client@0.2.0

## 0.1.1

### Bug Fixes

- Added support for Literal fields in multi-select form item component.
