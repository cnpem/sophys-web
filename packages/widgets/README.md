# @sophys-web/widgets

This package contains common react components and hooks for building the Sophys web application. It includes components for displaying and interacting with queues, environments, create forms for plans, and other UI elements that are used across the application.

The components are designed to be customizable and composable, allowing developers to easily integrate them into their own pages and components.

This package also works as a library of example components, demonstrating how to use the sophys-web architecture and consume the api endpoints in common ui components. So, if the customization options are not enough, you can always copy the code and modify it to your needs or compose default components with your own custom ones.

## Usage

To use the `widgets` package, follow these steps:

1. Add the package as a dependency in your project editing your app's `package.json`:

   ```json
   {
     "dependencies": {
       "@sophys-web/widgets": "workspace:*"
     }
   }
   ```

2. Import the components you want to use in your application `"@sophys-web/widgets/<component-name>"` and use them in your JSX code. For example, to use the `ControlBar` component:

   ```tsx
   import { ButtonGroup } from "@sophys-web/ui/button-group";
   import {
     ControlBar,
     EnvironmentControls,
     QueueControls,
     RunEngineControls,
   } from "@sophys-web/widgets/control-bar/control-bar";

   function MyControlBar() {
     return (
       <ControlBar className="rounded-none">
         <ButtonGroup>
           <EnvironmentControls />
           <QueueControls />
           <RunEngineControls />
         </ButtonGroup>
         <ButtonGroup>
           <button>Custom Button 1</button>
           <button>Custom Button 2</button>
         </ButtonGroup>
       </ControlBar>
     );
   }
   ```

   This will render a control bar with the default environment, queue, and run engine controls, as well as two custom buttons. It also overrides the default rounded corners of the control bar with `rounded-none`.
