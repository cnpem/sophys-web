# @sophys-web/pvws-store

This package provides a global store for managing WebSocket connections and component subscribers in Sophys Web applications.
It allows components to subscribe to PVs and be updated when the values change.
It is designed to manage the subscription lifecycle of PVs by the components, ensuring that components are only subscribed to the PVs they need and that they are unsubscribed when there are no subscribers left.

## How it works

The store maintains a map of PVs to their subscribers. When a component subscribes to a PV, it adds itself to the list of subscribers for that PV which triggers a WebSocket message to subscribe to the PV on the server if it is not already subscribed. When a component unsubscribes from a PV, it removes itself from the list of subscribers for that PV. If there are no subscribers left for a PV, the store sends a WebSocket message to unsubscribe from the PV on the server.

A dedicated component, `PVWSConnectionHandler`, manages the WebSocket connection and initializes the global store. This component is responsible for establishing and cleaning up the connection as needed. Because the store is global, individual components can subscribe to PVs directly using the provided hooks, `usePvData` and `usePvDataMap`. These hooks automatically handle the subscription lifecycle
on a particular pv or list of pvs, ensuring that components receive up-to-date PV values and are unsubscribed when no longer needed.

## Usage

### Basic Usage

To use the `pvws-store` package, follow these steps:

1. Add the package as a dependency in your project editing your app's `package.json`:

   ```json
   {
     "dependencies": {
       "@sophys-web/pvws-store": "workspace:*"
     }
   }
   ```

2. Import the `PVWSConnectionHandler` component in your application root:

   ```tsx
   import { PVWSConnectionHandler } from "@sophys-web/pvws-store";

   function App() {
     return (
       <div>
         <PVWSConnectionHandler />
         {/* Other components */}
       </div>
     );
   }
   ```

3. Use the provided hooks in your components to subscribe to PVs:

   ```tsx
   import { usePvData } from "@sophys-web/pvws-store";

   function MyComponent() {
     const pvData = usePvData("PV:example");

     return (
       <div>
         <h1>PV Value: {pvData?.value}</h1>
       </div>
     );
   }
   ```

4. If you need to subscribe to multiple PVs and map through them, it is more efficient to
   use the `usePvDataMap` hook instead of multiple `usePvData` calls and creating a map-like structure to store the data.

   Here is an example of how to use `usePvDataMap`:

   ```tsx
   import { usePvDataMap } from "@sophys-web/pvws-store";

   function MyComponent(idRange: number) {

   // Here we need React.useMemo to avoid unnecessary rerenders due to the array being recreated on every component mount
   const pvNames = useMemo(() => {
     return Array.from({ length: idRange }, (_, i) => `PV:${i}`);
   }, [idRange]);

   const pvDataMap = usePvDataMap(pvNames);

   return (
     <div>
       {pvNames.map((pvName) => (
         <div key={pvName}>
           {pvDataMap.get(pvName) ? pvDataMap.get(pvName)?.value : `Loading data for ${pvName}...`}
        </div>
       ))}
     </div>
   );
   ```

5. Ensure that your environment is configured with the `NEXT_PUBLIC_PVWS_URL` variable pointing to the WebSocket server URL.

### With side effects

If you need to perform side effects when PV data changes, you can use the `useEffect` hook in combination with the PV data hooks.

By side effects, we mean any operation that depends on the updated PV data and interacts with the outside world or has an observable effect beyond returning a value, such as logging, updating state, triggering animations, ui changes and more.

One basic example is logging the PV value whenever it changes:

```tsx
import { useEffect } from "react";
import { usePvData } from "@sophys-web/pvws-store";

function MyComponent() {
  const pvData = usePvData("PV:example");

  useEffect(() => {
    if (pvData) {
      console.log(`PV value updated: ${pvData.value}`);
    }
  }, [pvData]);

  return (
    <div>
      <h1>PV Value: {pvData?.value}</h1>
    </div>
  );
}
```

In this example, the `useEffect` hook is used to log the updated PV value to the console whenever it changes. The effect runs every time the `pvData` changes, allowing you to react to updates in the PV data as needed.
Instead of logging, you could trigger an alert or "toast" in the UI.

```tsx
import { useEffect } from "react";
import { toast } from "sonner";
import { usePvData } from "@sophys-web/pvws-store";

function MyComponent() {
  const pvData = usePvData("PV:example");

  useEffect(() => {
    if (pvData) {
      toast.info(`PV value updated: ${pvData.value}`);
    }
  }, [pvData]);

  return (
    <div>
      <h1>PV Value: {pvData?.value}</h1>
    </div>
  );
}
```

In a more complicated scenario, you might want to show in the ui if the pv value is increasing or decreasing.
For that, you will need a state to keep track of the trend (increasing, decreasing, stable) and a ref to store the previous value for comparison. Here is an example implementation:

```tsx
import { useEffect, useRef, useState } from "react";
import { usePvData } from "@sophys-web/pvws-store";

function MyComponent() {
  const pvData = usePvData("PV:example");
  const previousValueRef = useRef<number | null>(null);
  const [trend, setTrend] = useState<
    "increasing" | "decreasing" | "stable" | "unknown"
  >("unknown");

  useEffect(() => {
    if (pvData && typeof pvData.value === "number") {
      const currentValue = pvData.value;
      const previousValue = previousValueRef.current;

      if (previousValue !== null) {
        if (currentValue > previousValue) {
          setTrend("increasing");
        } else if (currentValue < previousValue) {
          setTrend("decreasing");
        } else if (currentValue === previousValue) {
          setTrend("stable");
        } else {
          setTrend("unknown");
        }
      }
      // Update the previous value for the next comparison
      previousValueRef.current = currentValue;
    }
  }, [pvData]);

  return (
    <div>
      <h1>
        PV Value: {pvData?.value}
        {trend === "increasing" && <span>&uarr;</span>}
        {trend === "decreasing" && <span>&darr;</span>}
      </h1>
    </div>
  );
}
```

This is also the case if you want to compare two different PVs. Lets say you want to trigger a toast warning if
"PV:example:1" is greater than "PV:example:2". You can do this by using either `usePvData` twice or `usePvDataMap` to subscribe to both PVs and then compare their values in a `useEffect` hook. Here is an example using `usePvData`:

```tsx
import { useEffect } from "react";
import { toast } from "sonner";
import { usePvData } from "@sophys-web/pvws-store";

function MyComponent() {
  const pvData1 = usePvData("PV:example:1");
  const pvData2 = usePvData("PV:example:2");

  useEffect(() => {
    if (!pvData1 || !pvData2) {
      return;
    }
    if (
      typeof pvData1.value === "number" &&
      typeof pvData2.value === "number"
    ) {
      if (pvData1.value > pvData2.value) {
        toast.warning("PV:example:1 is greater than PV:example:2");
      }
    }
  }, [pvData1, pvData2]);

  return (
    <div>
      <h1>PV 1 Value: {pvData1?.value}</h1>
      <h1>PV 2 Value: {pvData2?.value}</h1>
    </div>
  );
}
```

In this example, the `useEffect` hook checks if both PV data are available and then compares their values. If "PV:example:1" is greater than "PV:example:2", it triggers a warning toast. The effect runs every time either `pvData1` or `pvData2` changes, allowing you to react to updates in both PVs as needed.
