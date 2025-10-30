export interface KineticDevice {
    id: string;
    name: string;
    status: string;
    connectionState: string;
    lastSeen?: string;
    extraInfo?: {
        assemblyLine: string;
        jobNum: string;
        materialStatus: string;
        clearToBuild: boolean;
        remainingTime: string;
        unitPrice: number;
    };
}

export interface KineticMetric {
    deviceId: string;
    timestamp: string;
    type: string;
    value: number;
    unit: string;
}

export interface KineticCommand {
    deviceId: string;
    command: string;
    parameters?: Record<string, any>;
}

export interface KineticCommandResponse {
    success: boolean;
    message?: string;
    data?: any;
}