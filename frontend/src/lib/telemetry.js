/**
 * Provider-neutral telemetry shim.
 *
 * Wires the app to a single `reportError` / `reportEvent` surface so that
 * later swapping in Sentry, CloudWatch RUM, LogRocket, or Datadog RUM is a
 * one-file change — no component needs to be touched.
 *
 * Contract:
 *   - `reportError(error, context?)` is called by the top-level ErrorBoundary
 *     and by any catch-block that wants to surface an exception for ops.
 *   - `reportEvent(name, props?)` is reserved for funnel events (CTA clicks,
 *     checkout started, contact form submitted) so the go-live funnel can be
 *     instrumented without adding a tracking library.
 *
 * Providers can be plugged in via `REACT_APP_TELEMETRY_PROVIDER`:
 *   - unset / "none" — console-only (default, zero third-party shipped).
 *   - "sentry"       — expects `window.Sentry` to be loaded via a <script>
 *                      tag in index.html (keeps bundle size unchanged).
 *   - "beacon"       — POSTs a small JSON payload to
 *                      `REACT_APP_TELEMETRY_ENDPOINT` using
 *                      `navigator.sendBeacon` when available.
 *
 * The shim is SSR-safe and never throws: telemetry failure must not
 * cascade into app failure.
 */

const PROVIDER = (process.env.REACT_APP_TELEMETRY_PROVIDER || 'none').toLowerCase();
const ENDPOINT = process.env.REACT_APP_TELEMETRY_ENDPOINT || '';
const RELEASE = process.env.REACT_APP_RELEASE || 'dev';

function safeJson(obj) {
  try {
    return JSON.stringify(obj);
  } catch (_err) {
    return '"[unserialisable]"';
  }
}

function sendBeacon(payload) {
  if (!ENDPOINT) return false;
  if (typeof navigator === 'undefined') return false;
  try {
    const body = new Blob([safeJson(payload)], { type: 'application/json' });
    if (typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(ENDPOINT, body);
    }
    if (typeof fetch === 'function') {
      // keepalive so late-flush events still post during navigation.
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
      return true;
    }
  } catch (_err) {
    // Intentionally swallow — telemetry errors must not propagate.
  }
  return false;
}

/**
 * Report a runtime error. `context` should be small and non-PII.
 */
export function reportError(error, context) {
  try {
    // Always keep a console trail so browser devtools still show the error.
    // eslint-disable-next-line no-console
    console.error('[telemetry:error]', error, context);

    if (PROVIDER === 'sentry' && typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: context });
      return;
    }

    if (PROVIDER === 'beacon') {
      sendBeacon({
        type: 'error',
        release: RELEASE,
        message: error && error.message ? error.message : String(error),
        stack: error && error.stack ? error.stack : undefined,
        context,
        ts: Date.now(),
      });
    }
  } catch (_err) {
    // Never rethrow.
  }
}

/**
 * Report a named funnel event. Use sparingly; this is a marketing funnel
 * signal, not an analytics stream.
 */
export function reportEvent(name, props) {
  try {
    // eslint-disable-next-line no-console
    console.info('[telemetry:event]', name, props || {});

    if (PROVIDER === 'sentry' && typeof window !== 'undefined' && window.Sentry) {
      if (typeof window.Sentry.addBreadcrumb === 'function') {
        window.Sentry.addBreadcrumb({ category: 'funnel', message: name, data: props });
      }
      return;
    }

    if (PROVIDER === 'beacon') {
      sendBeacon({
        type: 'event',
        release: RELEASE,
        name,
        props,
        ts: Date.now(),
      });
    }
  } catch (_err) {
    // Never rethrow.
  }
}

const telemetry = { reportError, reportEvent };
export default telemetry;
