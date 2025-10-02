"use client";

export default function LiveToggle({
  enabled,
  setEnabled,
}: {
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => setEnabled(!enabled)}
      className={`px-3 py-2 rounded-xl border text-sm ${
        enabled ? "bg-green-600 text-white" : "bg-white"
      }`}
    >
      Live {enabled ? "ON" : "OFF"}
    </button>
  );
}
