interface PlacePrediction {
  placeId: string;
  text: {
    text: string;
  };
  structuredFormat: {
    mainText: {
      text: string;
    };
    secondaryText?: {
      text: string;
    };
  };
}

interface PlaceSuggestion {
  placePrediction: PlacePrediction | null;
}

interface AddressComponent {
  types: string[];
  longText: string;
  shortText: string;
}

interface AutocompleteRequest {
  input: string;
  includedRegionCodes?: string[];
  includedPrimaryTypes?: string[];
  sessionToken?: google.maps.places.AutocompleteSessionToken;
  language?: string;
  region?: string;
}

declare global {
  interface Window {
    google: typeof google & {
      maps: typeof google.maps & {
        importLibrary: (libraryName: string) => Promise<google.maps.PlacesLibrary>;
      };
    };
  }
}

namespace google.maps {
  interface PlacesLibrary {
    AutocompleteSuggestion: {
      fetchAutocompleteSuggestions: (request: AutocompleteRequest) => Promise<{ suggestions: PlaceSuggestion[] }>;
    };
    AutocompleteSessionToken: new () => google.maps.places.AutocompleteSessionToken;
    Place: new (options: { id: string; requestedLanguage?: string }) => {
      fetchFields: (options: { fields: string[] }) => Promise<void>;
      addressComponents?: AddressComponent[];
      location?: google.maps.LatLng;
      displayName?: string;
    };
  }
  
  namespace places {
    interface AutocompleteSessionToken {}
  }
}

export {};