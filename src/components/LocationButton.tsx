"use client";

import React, { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationButtonProps {
  onLocationSelect: (address: string) => void;
  className?: string;
}

export const LocationButton = ({ onLocationSelect, className = "" }: LocationButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const getAddressFromCoords = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      return data.display_name || `${lat}, ${lon}`;
    } catch (error) {
      console.error("Reverse geocoding error:", error);
      return `${lat}, ${lon}`;
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const address = await getAddressFromCoords(latitude, longitude);
          onLocationSelect(address);
          toast.success("Location updated!");
        } catch (err) {
          onLocationSelect(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          toast.info("Coordinates obtained, but address lookup failed.");
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLoading(false);
        if (error.code === 1) {
          toast.error("Location access denied. Please enable permissions in your browser.");
        } else if (error.code === 3) {
          toast.error("Location request timed out. Please try again.");
        } else {
          toast.error("Could not determine location. Please enter address manually.");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  return (
    <button
      type="button"
      onClick={handleGetLocation}
      disabled={isLoading}
      className={`flex items-center gap-2 text-[11px] font-bold text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-wider ${className}`}
    >
      {isLoading ? (
        <Loader2 size={12} className="animate-spin" />
      ) : (
        <MapPin size={12} />
      )}
      {isLoading ? "Locating..." : "Use Current Location"}
    </button>
  );
};
