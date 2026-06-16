# @sophys-web/ui

## 0.4.0

### Minor Changes

- 5c4d645: Added InputGroup components.

### Patch Changes

- 323687c: Updated accordion component to its latest reference from shadcn/ui.
- 6526721: Fixed cumulative increment in accordion content height on status change. The AccordionContent height increasingly grows on successive status changes (open/closed). This behavior is fixed by removing h-(--radix-accordion-content-height) class, to allow the div to grow to the height of its content.

## 0.3.0

### Minor Changes

- 48e54ea: add shadcn chart component

## 0.2.0

### Minor Changes

- b1f6dbc: Added hover-card component from shadcn-ui. Created window-card component. Enabled text-wrap in TableCell component.

## 0.1.1

### Patch Changes

- 18687a4: Added Item component set.
- 037d715: Created a controls widget component to manage environment, queue and run engine.
  Added the ability to destroy environments via the use-status hook in the api-client package.
  Added the ability to destroy environments in the controls widget in the widgets package.
  Updated the qua-ui and spu-ui packages to use the new controls widget.

  Added the button-group component set to the ui package.
  Added the spinner component to the ui package.
  Updated the ui package's alert-dialog component set based on the latest changes from shadcn/ui.

## 0.1.0

### Minor Changes

- Initial changeset
