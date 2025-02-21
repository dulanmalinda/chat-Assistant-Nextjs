"use client";

import { useEffect } from "react";

const ServiceWorker = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      import("workbox-window").then(({ Workbox }) => {
        const wb = new Workbox("/sw.js");

        wb.addEventListener("installed", (event) => {
          if (event.isUpdate) {
            console.log("New service worker installed. Refresh required.");
          }
        });

        wb.addEventListener("waiting", () => {
          console.log(
            "A new version of the service worker is waiting to activate."
          );
        });

        wb.addEventListener("activated", (event) => {
          if (event.isUpdate) {
            console.log("Service worker activated after an update.");
          }
        });

        wb.register()
          .then((registration) => {
            console.log("Workbox service worker registered:", registration);
          })
          .catch((error) => {
            console.error("Workbox registration failed:", error);
          });
      });
    }
  }, []);

  return null; // No UI needed
};

export default ServiceWorker;
