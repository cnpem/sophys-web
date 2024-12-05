"use client";

import * as React from "react";
import { ChevronsDownIcon, ChevronsUpIcon } from "lucide-react";
import { cn } from "@sophys-web/ui";
import { Button } from "./button";
import { TooltipProvider } from "./tooltip";

const BOTTOMBAR_COOKIE_NAME = "bottombar:state";
const BOTTOMBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 2;
const BOTTOMBAR_HEIGHT = "24rem";
const BOTTOMBAR_HEIGHT_ICON = "3rem";

interface BottombarContext {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleBottombar: () => void;
  triggerPosition: "bottom" | "top";
}

const BottombarContext = React.createContext<BottombarContext | null>(null);

function useBottombar() {
  const context = React.useContext(BottombarContext);
  if (!context) {
    throw new Error("useBottombar must be used within a BottombarProvider");
  }
  return context;
}

const BottombarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(
  (
    {
      defaultOpen = false,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [_open, _setOpen] = React.useState(defaultOpen);
    const isOpen = openProp ?? _open;
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(isOpen) : value;
        if (setOpenProp) {
          setOpenProp(openState);
        } else {
          _setOpen(openState);
        }
        document.cookie = `${BOTTOMBAR_COOKIE_NAME}=${openState}; path=/; max-age=${BOTTOMBAR_COOKIE_MAX_AGE}`;
      },
      [setOpenProp, isOpen],
    );

    const toggleBottombar = React.useCallback(() => {
      setOpen((open) => !open);
    }, [setOpen]);

    const state = isOpen ? "expanded" : "collapsed";

    const contextValue = React.useMemo<BottombarContext>(
      () => ({
        state,
        open: isOpen,
        setOpen,
        toggleBottombar,
        triggerPosition: state === "expanded" ? "top" : "bottom",
      }),
      [state, isOpen, setOpen, toggleBottombar],
    );

    return (
      <BottombarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            className={cn("group/bottombar-wrapper relative w-full", className)}
            ref={ref}
            style={
              {
                "--bottombar-height": BOTTOMBAR_HEIGHT,
                "--bottombar-height-icon": BOTTOMBAR_HEIGHT_ICON,
              } as React.CSSProperties
            }
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </BottombarContext.Provider>
    );
  },
);
BottombarProvider.displayName = "BottombarProvider";

const Bottombar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    variant?: "bottombar" | "floating" | "inset";
    collapsible?: "offcanvas" | "icon" | "none";
  }
>(
  (
    {
      variant = "bottombar",
      collapsible = "offcanvas",
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { state } = useBottombar();

    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "fixed bottom-0 left-0 right-0 h-[--bottombar-height] bg-background",
            className,
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50",
          "transition-[height] duration-300 ease-in-out",
          state === "expanded"
            ? "h-[--bottombar-height]"
            : "h-[--bottombar-height-icon]",
          variant === "floating" && "mx-4 mb-4 rounded-lg border shadow-lg",
          variant === "inset" &&
            "mx-4 mb-4 rounded-lg border bg-background shadow-lg",
          className,
        )}
        data-state={state}
        ref={ref}
        {...props}
      >
        {children}
      </div>
    );
  },
);
Bottombar.displayName = "Bottombar";

const BottombarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleBottombar, triggerPosition } = useBottombar();

  return (
    <Button
      className={cn(
        "fixed inset-x-0 z-50 mx-auto h-10 w-10 transition-all duration-300 ease-in-out",
        triggerPosition === "bottom"
          ? "bottom-[var(--bottombar-height-icon)]"
          : "bottom-[var(--bottombar-height)]",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleBottombar();
        console.log("BottombarTrigger", triggerPosition);
      }}
      ref={ref}
      size="icon"
      variant="ghost"
      {...props}
    >
      {triggerPosition === "top" ? (
        <ChevronsDownIcon className="h-4 w-4 transition-all ease-in-out hover:animate-bounce" />
      ) : (
        <ChevronsUpIcon className="h-4 w-4 transition-all ease-in-out hover:animate-bounce" />
      )}
      <span className="sr-only">Toggle Bottombar</span>
    </Button>
  );
});
BottombarTrigger.displayName = "BottombarTrigger";

const BottombarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "flex h-full flex-col overflow-auto bg-background p-4",
      className,
    )}
    ref={ref}
    {...props}
  />
));
BottombarContent.displayName = "BottombarContent";

export {
  Bottombar,
  BottombarContent,
  BottombarProvider,
  BottombarTrigger,
  useBottombar,
};
