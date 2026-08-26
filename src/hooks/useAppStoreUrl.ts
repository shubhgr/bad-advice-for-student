"use client";

import { useEffect, useState } from "react";
import {
  APP_STORE_BASE_URL,
  getAppStoreUrl,
  getTrackingParams,
} from "@/lib/utm";

/**
 * App download URL that carries UTMs from the GradRight landing URL
 * (via iframe query string) for the whole session.
 * Direct visits with no UTMs use the bare link.
 */
export function useAppStoreUrl(): string {
  const [url, setUrl] = useState(APP_STORE_BASE_URL);

  useEffect(() => {
    setUrl(getAppStoreUrl(getTrackingParams()));
  }, []);

  return url;
}
