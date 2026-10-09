"use client";

import { useEffect } from "react";

/**
 * Ported from the CSI site. Marks the visit as "arrived" once the opening sequence has
 * had time to play, so moving back to the home page later shows it straight away
 * instead of replaying the whole entrance.
 *
 * It also makes every fresh visit open at the top of the page (the hero): the browser
 * would otherwise restore the old scroll position on reload.
 */
export function ArrivalMarker() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash) window.scrollTo(0, 0);
    const timer = window.setTimeout(() => {
      document.documentElement.dataset.arrived = "";
    }, 2000);
    return () => window.clearTimeout(timer);
  }, []);
  return null;
}
