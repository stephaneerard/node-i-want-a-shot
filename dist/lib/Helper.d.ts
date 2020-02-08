export interface ArgvInterface {
    config: string;
    query: string;
    lite: boolean;
    api: boolean;
    edu: boolean;
    egp: boolean;
    ecosia: boolean;
    bing: boolean;
    lilo: boolean;
    path: string;
    pages: number;
    userAgent: string;
    resolutions: Array<string>;
    'concurrency-api': number;
    'concurrency-jpg': number;
    'delay-ms': number;
}
export interface RequestInterface {
    config?: string;
    query: string;
    basePath: string;
    computedPath?: string;
    lite: boolean;
    api: boolean;
    edu: boolean;
    egp: boolean;
    bing: boolean;
    ecosia: boolean;
    lilo: boolean;
    pages: number;
    userAgent: string;
    resolutions: Array<string>;
    'concurrency-api': number;
    'concurrency-jpg': number;
    'delay-ms': number;
}
export declare const builder: {
    lite: {
        type: string;
        default: boolean;
        description: string;
    };
    api: {
        type: string;
        default: boolean;
        description: string;
    };
    edu: {
        type: string;
        default: boolean;
        description: string;
    };
    egp: {
        type: string;
        default: boolean;
        description: string;
    };
    bing: {
        type: string;
        default: boolean;
        description: string;
    };
    ecosia: {
        type: string;
        default: boolean;
        description: string;
    };
    lilo: {
        type: string;
        default: boolean;
        description: string;
    };
    pages: {
        type: string;
        default: number;
    };
    path: {
        type: string;
        default: string;
    };
    'user-agent': {
        type: string;
        default: string;
    };
    resolutions: {
        type: string;
        default: string[];
    };
    config: {
        type: string;
        default: any;
        description: string;
    };
    'concurrency-jpg': {
        type: string;
        default: number;
        description: string;
    };
    'concurrency-api': {
        type: string;
        default: number;
        description: string;
    };
    'delay-ms': {
        type: string;
        default: number;
        description: string;
    };
};
export declare function takeAshot(request: RequestInterface): Promise<void>;
