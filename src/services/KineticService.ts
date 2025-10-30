import axios, { AxiosInstance } from 'axios';
import { KineticDevice, KineticMetric, KineticCommand, KineticCommandResponse } from '../types/kinetic';

export class KineticService {
    api: AxiosInstance;

    constructor(baseURL: string, apiKey: string) {
        // Create basic auth token
        const username = process.env.REACT_APP_KINETIC_USERNAME;
        const password = process.env.REACT_APP_KINETIC_PASSWORD;
        if (!username || !password) {
            throw new Error('Kinetic credentials not found in environment variables');
        }
        const basicAuth = btoa(`${username}:${password}`);

        this.api = axios.create({
            baseURL,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${basicAuth}`
            },
            params: {
                $format: 'json'
            }
        });
        
        console.log('KineticService initialized with URL:', baseURL);
    }

    async getDevices(): Promise<KineticDevice[]> {
        try {
            console.log('Fetching data from BAQ service...');
            const response = await this.api.get('', {
                params: {
                    $format: 'json'
                }
            });
            
            // Log the complete response for debugging
            console.log('Complete BAQ response:', response.data);
            
            // Handle the BAQ service response format
            let items = [];
            if (response.data && typeof response.data === 'object') {
                if (Array.isArray(response.data.value)) {
                    items = response.data.value;
                } else if (Array.isArray(response.data)) {
                    items = response.data;
                }
            }

            // Log the first item to see its structure
            if (items.length > 0) {
                console.log('First item structure:', items[0]);
            }

            console.log('Raw items:', items);

            return items.map((item: any) => {
                // Log raw item for debugging
                console.log('Processing BAQ row:', item);
                
                // Create a device object from BAQ data
                const device = {
                    id: `${item.OrderRel_OrderNum}-${item.OrderRel_OrderLine}`,
                    name: item.OrderDtl_LineDesc || item.OrderDtl_PartNum,
                    status: item.UDCodes1_CodeDesc || 'Unknown',
                    connectionState: item.OrderRel_OpenRelease ? 'Open' : 'Released',
                    lastSeen: item.UD27_BUPlanDate_c || item.OrderRel_ReqDate,
                    extraInfo: {
                        assemblyLine: item.OrderRel_AssemblyLine_c,
                        jobNum: item.JobAsmbl_JobNum,
                        materialStatus: item.UD27_Materials_c,
                        clearToBuild: item.Calculated_IsClearToBuild === 1,
                        remainingTime: item.Calculated_RemainingTime,
                        unitPrice: item.Calculated_UnitPrice
                    }
                };
                
                // Log mapped device for verification
                console.log('Mapped to device:', device);
                return device;
            });
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }

    async getDevice(deviceId: string): Promise<KineticDevice> {
        try {
            const response = await this.api.get(`/devices/${deviceId}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching device ${deviceId}:`, error);
            throw error;
        }
    }

    async getDeviceMetrics(deviceId: string, timeRange?: { start: string; end: string }): Promise<KineticMetric[]> {
        try {
            const params = timeRange ? { start: timeRange.start, end: timeRange.end } : {};
            const response = await this.api.get(`/devices/${deviceId}/metrics`, { params });
            return response.data;
        } catch (error) {
            console.error(`Error fetching metrics for device ${deviceId}:`, error);
            throw error;
        }
    }

    async sendCommand(deviceId: string, command: KineticCommand): Promise<KineticCommandResponse> {
        try {
            const response = await this.api.post(`/devices/${deviceId}/commands`, command);
            return response.data;
        } catch (error) {
            console.error(`Error sending command to device ${deviceId}:`, error);
            throw error;
        }
    }
}

export const kineticService = new KineticService(
    process.env.REACT_APP_KINETIC_API_URL || 'http://localhost:3000/api',
    process.env.REACT_APP_KINETIC_API_KEY || ''
);