# @sophys-web/pvws-store

This package provides a global store for managing WebSocket connections and component subscribers in Sophys Web applications.
It allows components to subscribe to PVs and be updated when the values change.
It is designed to manage the subscription lifecycle of PVs by the components, ensuring that components are only subscribed to the PVs they need and that they are unsubscribed when there are no subscribers left.

## How it works

The store maintains a map of PVs to their subscribers. When a component subscribes to a PV, it adds itself to the list of subscribers for that PV which triggers a WebSocket message to subscribe to the PV on the server if it is not already subscribed. When a component unsubscribes from a PV, it removes itself from the list of subscribers for that PV. If there are no subscribers left for a PV, the store sends a WebSocket message to unsubscribe from the PV on the server.

A dedicated component, `PVWSConnectionHandler`, manages the WebSocket connection and initializes the global store. This component is responsible for establishing and cleaning up the connection as needed. Because the store is global, individual components can subscribe to PVs directly using the provided hooks, `useSinglePvData` and `useMultiplePvData`. These hooks automatically handle the subscription lifecycle
on a particular pv or list of pvs, ensuring that components receive up-to-date PV values and are unsubscribed when no longer needed.

## Usage

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
   import { useMultiplePvData, useSinglePvData } from "@sophys-web/pvws-store";

   function MyComponent() {
     const pvData = useSinglePvData("PV:example");

     return (
       <div>
         <h1>PV Value: {pvData?.value}</h1>
       </div>
     );
   }
   ```

4. If you need to subscribe to multiple PVs, use the `useMultiplePvData` hook:

   ```tsx
   import { useMultiplePvData } from "@sophys-web/pvws-store";

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
