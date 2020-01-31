export interface ArgvInterface {
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
}
export interface RequestInterface {
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
};
export declare function takeAshot(request: RequestInterface): Promise<void>;
