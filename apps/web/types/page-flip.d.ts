declare module 'page-flip' {
  export class PageFlip {
    constructor(el: HTMLElement, settings: Record<string, unknown>);
    loadFromImages(images: string[]): void;
    on(event: 'flip' | 'changeOrientation' | 'init' | 'changeState', cb: (e: { data: unknown }) => void): this;
    flipNext(corner?: 'top' | 'bottom'): void;
    flipPrev(corner?: 'top' | 'bottom'): void;
    flip(page: number, corner?: 'top' | 'bottom'): void;
    turnToPage(page: number): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): 'portrait' | 'landscape';
    destroy(): void;
  }
}
