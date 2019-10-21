export interface Emitter {
    logger: string;
    pending: boolean;
}

export interface Observer {
    update(emitter: Emitter): void;
}