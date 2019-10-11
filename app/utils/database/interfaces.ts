export interface Emitter {
    isConnected: boolean;
    isCreated: boolean;
    isUploaded: boolean;
    pending: boolean;
    logger: string;
    progress: number;
}

export interface Observer {
    update(emitter: Emitter): void;
}