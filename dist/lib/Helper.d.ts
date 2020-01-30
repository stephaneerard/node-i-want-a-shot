export interface RequestInterface {
    query: string;
    path: string;
    screenshot: boolean;
    api: boolean;
    pages: number;
}
export declare function takeAshot(request: RequestInterface): Promise<void>;
