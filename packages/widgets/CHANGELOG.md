# @sophys-web/widgets

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
