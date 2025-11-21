// Type declaration for the Spline 3D viewer web component
// This lets us use <spline-viewer> in our React components with proper TypeScript support
declare namespace JSX {
  interface IntrinsicElements {
    'spline-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
      url?: string;
    };
  }
}
