export interface RequestInterface {
    query: string;
    path: string;
    lite: boolean;
    api: boolean;
    edu: boolean;
    egp: boolean;
    pages: number;
    userAgent: string;
    resolutions: Array<string>;
}
export declare function takeAshot(request: RequestInterface): Promise<void>;
