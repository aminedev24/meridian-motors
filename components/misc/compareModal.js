// compareModal.js — vehicle comparison dialog.
// Redesign goals: price-first comparison (the old table didn't even show
// prices), photo-led column headers, "best value" callouts so the winner in
// each key metric is obvious at a glance, and proper dialog behavior
// (Escape/backdrop close, scroll lock, sticky spec column for mobile scroll).
import React, { useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faScaleBalanced,
  faCar,
  faCrown,
} from "@fortawesome/free-solid-svg-icons";
import { useCompare } from "../vehicles/useCompare";
import { formatNumberWithUnit } from "../utilities/numberFormat";

const ROWS = [
  { key: "year", label: "Year" },
  { key: "mileage", label: "Mileage", format: (v) => (v ? `${formatNumberWithUnit(v)} km` : "N/A") },
  { key: "engine", label: "Engine", format: (v) => (v ? formatNumberWithUnit(v) : "N/A") },
  { key: "transmission", label: "Transmission" },
  { key: "drive", label: "Drive" },
  { key: "fuel", label: "Fuel" },
  { key: "bodyType", label: "Body Type" },
  { key: "seats", label: "Seats" },
  { key: "color", label: "Color" },
  { key: "modelCode", label: "Model Code" },
  { key: "grade", label: "Grade" },
  { key: "chassis", label: "Chassis No." },
];

const BestBadge = ({ children }) => (
  <span className="ml-1.5 inline-flex items-center gap-1 whitespace-nowrap bg-[var(--accent-color)] px-1.5 py-0.5 align-middle text-[9px] font-extrabold uppercase tracking-wider text-white">
    <FontAwesomeIcon icon={faCrown} className="h-2 w-2" />
    {children}
  </span>
);

const CompareModal = ({ onClose }) => {
  const { items, removeFromCompare } = useCompare();

  // Removing the last vehicle inside the dialog shouldn't leave an empty shell.
  useEffect(() => {
    if (items.length === 0) onClose();
  }, [items.length, onClose]);

  // Dialog hygiene: lock page scroll + close on Escape while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Highlight the winner when at least two vehicles actually compete.
  const bestRefs = useMemo(() => {
    const priced = items.filter((c) => Number(c.price) > 0);
    const withKm = items.filter((c) => Number(c.mileage) > 0);
    return {
      price:
        priced.length > 1
          ? priced.reduce((a, b) => (Number(b.price) < Number(a.price) ? b : a)).ref
          : null,
      mileage:
        withKm.length > 1
          ? withKm.reduce((a, b) => (Number(b.mileage) < Number(a.mileage) ? b : a)).ref
          : null,
    };
  }, [items]);

  const cellBase = "border-b border-gray-100 px-4 py-3 text-[13px] text-[var(--text-color)]";
  const labelBase =
    "sticky left-0 z-10 border-b border-gray-100 bg-[var(--white)] px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400";

  return (
    <div
      className="fixed inset-0 z-[900] flex justify-center bg-black/50 p-0 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Comparing ${items.length} vehicles`}
        onClick={(e) => e.stopPropagation()}
        className="m-auto flex max-h-[88vh] w-full max-w-6xl animate-[compare-pop_0.22s_ease-out] flex-col overflow-hidden rounded-t-2xl border border-gray-200 bg-[var(--white)] shadow-2xl sm:rounded-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <h2 className="flex items-center gap-2.5 font-display text-base font-bold text-brand-charcoal lg:text-lg">
            <FontAwesomeIcon icon={faScaleBalanced} className="text-brand-navy" />
            Compare Vehicles
            <span className="bg-brand-navy/10 px-2 py-0.5 font-mono text-xs font-bold text-brand-navy">
              {items.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison"
            className="grid h-9 w-9 place-items-center text-gray-400 transition hover:bg-gray-100 hover:text-brand-charcoal"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>

        {/* Comparison grid */}
        <div className="overflow-auto">
          <table className="w-full min-w-[680px] border-collapse text-sm">
            <thead>
              <tr>
                <th className={`${labelBase} top-0 z-30 w-32`} aria-label="Spec" />
                {items.map((car) => (
                  <th
                    key={car.ref}
                    className="sticky top-0 z-20 min-w-[180px] border-b border-gray-200 bg-[var(--white)] p-3 text-left align-top"
                  >
                    <div className="relative mb-2.5 h-20 w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 sm:h-24">
                      {car.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={car.image}
                          alt={`${car.make} ${car.model}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-gray-300">
                          <FontAwesomeIcon icon={faCar} className="text-3xl" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeFromCompare(car.ref)}
                        aria-label={`Remove ${car.make} ${car.model} from comparison`}
                        title="Remove"
                        className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white transition hover:bg-red-600"
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="font-display text-sm font-bold uppercase leading-tight text-brand-charcoal">
                      {car.make} {car.model}
                    </div>
                    <div className="mt-1 inline-block bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-gray-500">
                      {car.ref || "—"}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Price gets its own emphasized band above the spec rows */}
            <tbody>
              <tr>
                <td className={labelBase}>FOB Price</td>
                {items.map((car) => (
                  <td key={car.ref} className="border-b border-t border-gray-200 bg-gray-50/70 px-4 py-3">
                    {Number(car.price) > 0 ? (
                      <span className="flex items-center font-display text-lg font-extrabold text-[var(--accent-color)]">
                        {car.currency} {Number(car.price).toLocaleString("en-US")}
                        {bestRefs.price === car.ref && <BestBadge>Best FOB</BestBadge>}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold italic text-gray-400">Price on request</span>
                    )}
                  </td>
                ))}
              </tr>

              {ROWS.map((row) => (
                <tr key={row.key}>
                  <td className={labelBase}>{row.label}</td>
                  {items.map((car) => {
                    const raw = car[row.key];
                    const value = raw !== "" && raw != null ? (row.format ? row.format(raw) : raw) : "—";
                    const isBest = row.key === "mileage" && bestRefs.mileage === car.ref && raw;
                    return (
                      <td key={car.ref} className={`${cellBase} ${isBest ? "font-semibold" : ""}`}>
                        {value}
                        {isBest && <BestBadge>Lowest km</BestBadge>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer hint */}
        <div className="border-t border-gray-200 bg-gray-50 px-5 py-2.5 text-[11px] text-gray-400">
          Prices are approximate FOB Japan and exclude freight &mdash; tap a vehicle on the stock list for full details.
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
