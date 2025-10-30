import React, { useEffect, useState } from 'react';
import { KineticDevice } from '../types/kinetic';
import { kineticService } from '../services/KineticService';

const DeviceList: React.FC<{
  onDeviceSelect: (device: KineticDevice) => void;
}> = ({ onDeviceSelect }) => {
  const [devices, setDevices] = useState<KineticDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const fetchedDevices = await kineticService.getDevices();
        setDevices(fetchedDevices);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch devices');
        setLoading(false);
      }
    };

    fetchDevices();
  }, []);

  if (loading) return <div>Loading devices...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="device-list">
      <h2>Devices</h2>
      <div className="device-grid">
        {devices.map((device) => (
          <div
            key={device.id}
            className={`device-card ${device.connectionState.toLowerCase()}`}
            onClick={() => onDeviceSelect(device)}
          >
            <h3>Order: {device.id}</h3>
            <p>Description: {device.name}</p>
            <p>Production Status: {device.status}</p>
            <p>Release Status: {device.connectionState}</p>
            {device.lastSeen && (
              <p>Build Plan Date: {new Date(device.lastSeen).toLocaleString()}</p>
            )}
            {device.extraInfo && (
              <div className="extra-info">
                <p>Assembly Line: {device.extraInfo.assemblyLine}</p>
                <p>Job Number: {device.extraInfo.jobNum}</p>
                <p>Materials: {device.extraInfo.materialStatus}</p>
                <p>Clear to Build: {device.extraInfo.clearToBuild ? 'Yes' : 'No'}</p>
                <p>Remaining Time: {device.extraInfo.remainingTime}</p>
                <p>Unit Price: ${device.extraInfo.unitPrice}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceList;