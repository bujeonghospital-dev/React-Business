// Type definitions for Google Maps Web Components
declare namespace JSX {
  interface IntrinsicElements {
    "gmp-map": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        center?: string;
        zoom?: string;
        "map-id"?: string;
      },
      HTMLElement
    >;
    "gmp-advanced-marker": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        position?: string;
        title?: string;
      },
      HTMLElement
    >;
  }
}

export {};
