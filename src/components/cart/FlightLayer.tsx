"use client";

import { motion } from "framer-motion";
import { useFlights, type Flight } from "@/lib/flight-store";

/** Where flights land: the header's bag button. */
function bagTarget() {
  const el = document.querySelector("[data-bag-target]");
  const rect = el?.getBoundingClientRect();
  return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: window.innerWidth - 60, y: 40 };
}

function FlyingItem({ flight }: { flight: Flight }) {
  const land = useFlights((state) => state.land);
  const { from } = flight;
  const target = bagTarget();
  const peakY = Math.min(from.y, target.y) - 120;
  const midX = from.x + (target.x - from.x) * 0.55;

  return (
    <motion.img
      src={flight.image}
      alt=""
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[160] object-contain drop-shadow-[0_18px_24px_rgba(0,0,0,0.35)]"
      style={{ width: from.width, height: from.height, marginLeft: -from.width / 2, marginTop: -from.height / 2 }}
      initial={{ x: from.x, y: from.y, scale: 1, rotate: 0, opacity: 1 }}
      animate={{
        x: [from.x, midX, target.x],
        y: [from.y, peakY, target.y],
        scale: [1, 0.7, 28 / from.width],
        rotate: [0, -10, 6],
        opacity: [1, 1, 0.2],
      }}
      transition={{ duration: 0.85, ease: [0.45, 0, 0.2, 1], times: [0, 0.45, 1] }}
      onAnimationComplete={() => land(flight.id)}
    />
  );
}

/** Products flying from where they were added into the header's bag. */
export default function FlightLayer() {
  const flights = useFlights((state) => state.flights);
  return (
    <>
      {flights.map((flight) => (
        <FlyingItem key={flight.id} flight={flight} />
      ))}
    </>
  );
}
