import React, { useState } from 'react';
import DeviceList from './DeviceList';
import DeviceDetails from './DeviceDetails';
import { KineticDevice } from '../types/kinetic';

const App: React.FC = () => {
  const [selectedDevice, setSelectedDevice] = useState<KineticDevice | null>(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Kinetic Device Manager</h1>
      </header>

      <main className="app-main">
        {selectedDevice ? (
          <DeviceDetails
            device={selectedDevice}
            onBack={() => setSelectedDevice(null)}
          />
        ) : (
          <DeviceList onDeviceSelect={setSelectedDevice} />
        )}
      </main>
    </div>
  );
};

export default App;