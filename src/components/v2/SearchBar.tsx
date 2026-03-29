"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AddressSearchInput from "@/components/property-search/AddressSearchInput";

const models = [
  { id: "auto", label: "Auto" },
  { id: "speed", label: "Speed" },
  { id: "balanced", label: "Balanced", locked: true },
  { id: "max-iq", label: "Max IQ", locked: true },
] as const;

type ModelId = (typeof models)[number]["id"];

export default function SearchBar() {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelId>("auto");

  function handleSubmit() {
    if (!selectedAddress.trim()) return;
    router.push(
      `/v2/analyze?address=${encodeURIComponent(selectedAddress)}&model=${selectedModel}`
    );
  }

  return (
    <div className="relative mx-auto w-full" style={{ maxWidth: 640 }}>
      <style>{`
        .v2-searchbar-wrapper input {
          color: #e8e6f0 !important;
          font-size: 16px !important;
          font-family: inherit !important;
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          width: 100% !important;
          padding: 0 !important;
        }
        .v2-searchbar-wrapper input::placeholder {
          color: #3a3758 !important;
        }
        .v2-searchbar-wrapper input:focus {
          ring: none !important;
          outline: none !important;
          box-shadow: none !important;
        }
        .v2-searchbar-wrapper > div {
          position: static !important;
        }
        .v2-searchbar-wrapper .absolute {
          display: none !important;
        }
        .v2-search-box:focus-within {
          border-color: rgba(127,119,221,0.65) !important;
          box-shadow: 0 0 0 3px rgba(83,74,183,0.1);
        }
      `}</style>

      <div
        className="v2-search-box transition-all"
        style={{
          background: "#13121d",
          border: "1px solid rgba(127,119,221,0.3)",
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        {/* Top row — address input */}
        <div
          className="relative flex items-center"
          style={{ padding: "18px 56px 18px 20px" }}
        >
          {/* Search icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7F77DD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <div className="v2-searchbar-wrapper flex-1">
            <AddressSearchInput
              onAddressSelect={(address, placeId) => {
                setSelectedAddress(address);
                setSelectedPlaceId(placeId);
              }}
              placeholder="Enter a property address — e.g. 123 Oak St, Oakland CA..."
            />
          </div>

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            className="absolute flex items-center justify-center transition-colors"
            style={{
              right: 12,
              top: 14,
              width: 36,
              height: 36,
              background: "#534AB7",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#6258cc")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "#534AB7")
            }
            aria-label="Analyze property"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 0.5,
            background: "rgba(127,119,221,0.12)",
          }}
        />

        {/* Bottom row — model selector */}
        <div className="flex items-center gap-3 px-4 py-2.5">
          <span
            className="shrink-0 uppercase"
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "#3a3758",
              fontWeight: 600,
            }}
          >
            AI Model
          </span>

          <div className="flex items-center gap-1">
            {models.map((model) => {
              const isActive = selectedModel === model.id;
              return (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className="whitespace-nowrap rounded-md px-2.5 py-1 font-medium transition-colors"
                  style={{
                    background: isActive
                      ? "rgba(83,74,183,0.25)"
                      : "transparent",
                    border: isActive
                      ? "0.5px solid rgba(127,119,221,0.45)"
                      : "0.5px solid transparent",
                    color: isActive ? "#c0baf0" : "#4e4a6a",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#8882b8";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#4e4a6a";
                  }}
                >
                  {model.label}
                  {"locked" in model && model.locked && (
                    <span
                      className="ml-1 inline-block"
                      style={{ fontSize: 9, opacity: 0.45 }}
                    >
                      🔒
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
