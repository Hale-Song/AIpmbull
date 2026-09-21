declare module "pdfjs-dist/build/pdf.mjs" {
  export const GlobalWorkerOptions: {
    workerSrc: string;
  };
  export function getDocument(params: { data: ArrayBuffer }): {
    promise: Promise<{
      numPages: number;
      getPage(pageNum: number): {
        getTextContent(): Promise<{
          items: Array<{
            str?: string;
            transform: number[];
            dir?: string;
            fontName?: string;
          }>;
        }>;
        getViewport(params: { scale: number }): {
          width: number;
          height: number;
        };
        render(params: {
          canvasContext: CanvasRenderingContext2D;
          viewport: { width: number; height: number };
        }): { promise: Promise<void> };
        cleanup(): void;
      };
    }>;
  };
}
