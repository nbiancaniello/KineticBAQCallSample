import React, { useEffect, useState } from 'react';
import { KineticDevice, KineticMetric } from '../types/kinetic';
import { kineticService } from '../services/KineticService';

interface DeviceDetailsProps {
  device: KineticDevice;
  onBack: () => void;
}

const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, onBack }) => {
  const [metrics, setMetrics] = useState<KineticMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        const metrics = await kineticService.getDeviceMetrics(device.id, {
          start: twentyFourHoursAgo.toISOString(),
          end: now.toISOString(),
        });
        
        setMetrics(metrics);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch device metrics');
        setLoading(false);
      }
    };

    //fetchMetrics();
  }, [device.id]);

  const renderMetrics = () => {
    const groupedMetrics = metrics.reduce((acc: Record<string, KineticMetric[]>, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push(metric);
      return acc;
    }, {});

    return Object.entries(groupedMetrics).map(([type, typeMetrics]) => (
      <div key={type} className="metric-group">
        <h3>{type}</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Value</th>
              <th>Unit</th>
            </tr>
          </thead>
          <tbody>
            {typeMetrics.map((metric, index) => (
              <tr key={`${metric.deviceId}-${metric.timestamp}-${index}`}>
                <td>{new Date(metric.timestamp).toLocaleString()}</td>
                <td>{metric.value}</td>
                <td>{metric.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  return (
    <div className="device-details">
      <button onClick={onBack} className="back-button">
        ← Back to Devices
      </button>
      
      <div className="device-header">
        <h2>{device.name}</h2>
        <div className="device-status">
          <span className={`status-indicator ${device.connectionState.toLowerCase()}`} />
          <span>{device.status}</span>
        </div>
      </div>

      <div className="device-info">
        <p><strong>ID:</strong> {device.id}</p>
        <p><strong>Connection State:</strong> {device.connectionState}</p>
        {device.lastSeen && (
          <p><strong>Last Seen:</strong> {new Date(device.lastSeen).toLocaleString()}</p>
        )}
      </div>

      <div className="device-metrics">
        <h3>Device Metrics (Last 24 Hours)</h3>
        {loading && <div>Loading metrics...</div>}
        {error && <div className="error-message">Error: {error}</div>}
        {!loading && !error && metrics.length === 0 && (
          <div>No metrics available for the last 24 hours</div>
        )}
        {!loading && !error && metrics.length > 0 && renderMetrics()}
      </div>
    </div>
  );
};

export default DeviceDetails;