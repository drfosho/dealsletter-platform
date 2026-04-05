"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AddressSearchInput from "@/components/property-search/AddressSearchInput";

interface SearchBarProps {
  userTier?: "free" | "pro" | "pro_max" | null;
  onModelChange?: (model: string) => void;
}

export default function SearchBar({
  userTier = null,
  onModelChange,
}: SearchBarProps) {
  const router = useRouter();
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPlaceId, setSelectedPlaceId] = useState("");
  const [hoveredChip, setHoveredChip] = useState<string | null>(null);

  const defaultModel = (() => {
    if (userTier === "pro_max") return "max";
    if (userTier === "pro") return "balanced";
    return "speed";
  })();

  const [selectedModel, setSelectedModel] = useState(defaultModel);

  useEffect(() => {
    let def = "speed";
    if (userTier === "pro_max") def = "max";
    else if (userTier === "pro") def = "balanced";
    setSelectedModel(def);
    onModelChange?.(def);
  }, [userTier]);

  const chips = [
    {
      id: "speed",
      label: "Speed",
      description: "GPT-4o-mini \u2014 fastest",
      available: true,
    },
    {
      id: "balanced",
      label: "Balanced",
      description: "Claude Sonnet / GPT-4.1",
      available: userTier === "pro" || userTier === "pro_max",
      upgradeHint: "Upgrade to Pro to unlock",
    },
    {
      id: "max",
      label: "Max IQ",
      description:
        userTier === "pro_max" ? "3 models parallel" : "Pro Max only",
      available: userTier === "pro_max",
      upgradeHint: "Upgrade to Pro Max to unlock",
    },
  ];

  function handleSubmit() {
    if (!selectedAddress.trim()) return;
    router.push(
      `/v2/analyze?address=${encodeURIComponent(selectedAddress)}&model=${selectedModel}`
    );
  }

  return (
    <div className="relative mx-auto w-full" style={{ width: '100%', maxWidth: 640, boxSizing: 'border-box' }}>
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
          color: #4e4a6a !important;
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
        @media (max-width: 390px) {
          .model-chip-row {
            gap: 3px !important;
            padding: 8px 10px !important;
          }
          .model-chip {
            font-size: 11px !important;
            padding: 3px 8px !important;
          }
          .model-label {
            font-size: 10px !important;
            margin-right: 3px !important;
          }
        }
      `}</style>

      <div
        className="v2-search-box transition-all"
        style={{
          background: "#13121d",
          border: "1px solid rgba(127,119,221,0.4)",
          borderRadius: 16,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* Top row — address input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            gap: '10px',
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#7F77DD"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="shrink-0"
            style={{ opacity: 0.7 }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          <div className="v2-searchbar-wrapper" style={{ flex: 1, minWidth: 0 }}>
            <AddressSearchInput
              onAddressSelect={(address, placeId) => {
                setSelectedAddress(address);
                setSelectedPlaceId(placeId);
              }}
              placeholder="Enter a property address — e.g. 123 Oak St, Oakland CA..."
            />
          </div>

          <button
            onClick={handleSubmit}
            className="flex items-center justify-center transition-colors"
            style={{
              width: 38,
              height: 38,
              background: "#534AB7",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: 'auto',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
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
        <div style={{ height: 0.5, background: "rgba(127,119,221,0.18)" }} />

        {/* Bottom row — model selector */}
        <div className="model-chip-row flex items-center gap-3 px-4 py-2.5">
          <span
            className="model-label shrink-0 uppercase"
            style={{
              fontSize: 12,
              letterSpacing: "0.06em",
              color: "#6b6690",
              fontWeight: 600,
            }}
          >
            AI Model
          </span>

          <div className="flex items-center gap-1">
            {chips.map((chip) => {
              const isSelected = selectedModel === chip.id;
              const isAvailable = chip.available;

              return (
                <div
                  key={chip.id}
                  style={{ position: "relative", display: "inline-flex" }}
                  onMouseEnter={() => {
                    if (!isAvailable) setHoveredChip(chip.id);
                  }}
                  onMouseLeave={() => setHoveredChip(null)}
                >
                  <button
                    className="model-chip"
                    onClick={() => {
                      if (!isAvailable) {
                        router.push("/v2/pricing");
                        return;
                      }
                      setSelectedModel(chip.id);
                      onModelChange?.(chip.id);
                    }}
                    style={{
                      fontSize: 13,
                      padding: "4px 12px",
                      borderRadius: 6,
                      cursor: isAvailable ? "pointer" : "default",
                      transition: "all 0.15s",
                      fontFamily: "inherit",
                      fontWeight: 500,
                      background:
                        isSelected && isAvailable
                          ? "rgba(83,74,183,0.25)"
                          : "transparent",
                      border: `0.5px solid ${isSelected && isAvailable ? "rgba(127,119,221,0.45)" : "transparent"}`,
                      color: isSelected && isAvailable
                        ? "#c0baf0"
                        : isAvailable
                          ? "#9994b8"
                          : "#4e4a6a",
                      opacity: isAvailable ? 1 : 0.6,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected && isAvailable)
                        e.currentTarget.style.color = "#c0baf0";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected && isAvailable)
                        e.currentTarget.style.color = "#9994b8";
                    }}
                  >
                    {chip.label}
                    {!isAvailable && (
                      <span style={{ fontSize: 9, opacity: 0.5, marginLeft: 2, color: "#4e4a6a" }}>
                        &#x1F512;
                      </span>
                    )}
                  </button>

                  {/* Tooltip for locked chips */}
                  {hoveredChip === chip.id && !isAvailable && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "calc(100% + 6px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#1a192b",
                        border: "0.5px solid rgba(127,119,221,0.3)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        fontSize: 11,
                        color: "#9994b8",
                        whiteSpace: "nowrap",
                        zIndex: 10,
                        pointerEvents: "none",
                      }}
                    >
                      {chip.upgradeHint}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
