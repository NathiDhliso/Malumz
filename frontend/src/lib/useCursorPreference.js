import { useCallback, useEffect, useState } from "react";

/**
 * localStorage key that persists the user's custom-cursor preference.
 *
 * Any value other than the literal string `"on"` (including a missing key,
 * an empty string, or arbitrary text) is normalized to `"off"` on read so
 * the default behaviour is to keep the native OS cursor visible.
 *
 * @see Requirements 6.1, 6.2
 */
export const CURSOR_KEY = "e1.cursor.custom";

/**
 * Read the stored cursor preference, normalizing every non-"on" value
 * (missing key, empty string, arbitrary text, or localStorage access
 * failure) to `"off"`.
 *
 * The try/catch guards against Safari private-mode where
 * `window.localStorage` access throws a SecurityError.
 *
 * @returns {"on" | "off"}
 */
function read() {
  try {
    return window.localStorage.getItem(CURSOR_KEY) === "on" ? "on" : "off";
  } catch {
    return "off";
  }
}

/**
 * React hook that exposes the cursor preference as a `[value, setPreference]`
 * tuple backed by the `e1.cursor.custom` localStorage key.
 *
 * Behaviour:
 * - Reads the stored value on mount; normalizes anything that is not the
 *   literal string `"on"` to `"off"`.
 * - Subscribes to `window` `storage` events so changes in other tabs are
 *   reflected immediately, and removes the listener on unmount.
 * - Wraps every `localStorage` read and write in `try/catch` so Safari
 *   private-mode failures degrade to `"off"` rather than throwing.
 *
 * @returns {["on" | "off", (next: string) => void]}
 * @see Requirements 6.1, 6.2
 */
export function useCursorPreference() {
  const [value, setValue] = useState(read);

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === CURSOR_KEY) {
        setValue(read());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setPreference = useCallback((next) => {
    const v = next === "on" ? "on" : "off";
    try {
      window.localStorage.setItem(CURSOR_KEY, v);
    } catch {
      // Safari private mode and similar sandboxed environments throw on
      // localStorage writes. Swallow the error so the in-memory state still
      // updates to the normalized value below.
    }
    setValue(v);
  }, []);

  return [value, setPreference];
}
