export interface RequestInterface {
    query: string;
    path: string;
    screenshot: boolean;
    api: boolean;
    pages: number;
    userAgent: string;
    resolutions: Array<string>;
}
export declare function takeAshot(request: RequestInterface): Promise<void>;
