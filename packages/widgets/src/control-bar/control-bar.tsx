import { cn } from "@sophys-web/ui";

export { EnvironmentControls } from "./environment-controls";
export { QueueControls } from "./queue-controls";
export { RunEngineControls } from "./run-engine-controls";

/**
 * ControlBar is a container component for housing controls related to the beamline environment, queue management, and run engine operations.
 * It provides layout for these controls, which are essential for managing the state and operations of the beamline.
 * The ControlBar is designed to be fixed at the top of the viewport for easy access, and it uses a backdrop blur effect to ensure that it remains visible without obstructing the view of other content on the page.
 *
 * @example Default control bar with all controls visible and a third group for custom controls
 * ```tsx
 * import {
 *   ControlBar,
 *   EnvironmentControls,
 *   QueueControls,
 *   RunEngineControls,
 * } from "@sophys-web/widgets/control-bar/control-bar";
 * import { ButtonGroup } from "@sophys-web/ui/button-group";
 *
 * ...
 *
 * <ControlBar>
 *  <ButtonGroup>
 *   <EnvironmentControls />
 *   <QueueControls />
 *  </ButtonGroup>
 *  <ButtonGroup>
 *   <RunEngineControls />
 *  </ButtonGroup>
 *  <ButtonGroup>
 *   <CustomControl1 />
 *   <CustomControl2 />
 *  </ButtonGroup>
 * </ControlBar>
 * ```
 *
 * @example Custom control bar hiding the pause and next checkpoint buttons in the Run Engine Controls
 * ```tsx
 * import {
 *   ControlBar,
 *   EnvironmentControls,
 *   QueueControls,
 *   RunEngineControls,
 * } from "@sophys-web/widgets/control-bar/control-bar";
 * import { ButtonGroup } from "@sophys-web/ui/button-group";
 *
 * ...
 *
 * <ControlBar>
 *  <ButtonGroup>
 *   <EnvironmentControls />
 *   <QueueControls />
 *  </ButtonGroup>
 *  <ButtonGroup>
 *   <RunEngineControls hidePauseNextCheckpoint/>
 *  </ButtonGroup>
 * </ControlBar>
 * ```
 */
export function ControlBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-accent animate-in slide-in-from-top fixed inset-x-0 top-2 z-40 mx-auto flex w-fit items-center justify-between gap-2 rounded-full border px-4 py-2 opacity-95 backdrop-blur-lg duration-500",
        className,
      )}
    >
      {children}
    </div>
  );
}
