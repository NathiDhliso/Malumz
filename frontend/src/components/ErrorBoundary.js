import React from 'react';

/**
 * Global ErrorBoundary — protects the whole app from single-component
 * runtime failures that would otherwise white-screen visitors and spike
 * drop-off.
 *
 * Renders a minimal branded fallback with an email CTA and a reload action.
 * All errors are logged to `console.error` so ops can still see them via
 * browser telemetry / Sentry / CloudWatch RUM if wired up later.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Emit structured log so ops tooling picks it up without leaking PII.
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        role="alert"
        className="min-h-screen bg-e1-bg text-e1-text flex items-center justify-center px-6"
      >
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl md:text-4xl mb-4">
            Something broke on our side.
          </h1>
          <p className="font-sans text-e1-text-muted mb-8">
            Refresh the page, or email{' '}
            <a
              href="mailto:nkosinathi.dhliso@gmail.com"
              className="text-e1-primary underline"
            >
              nkosinathi.dhliso@gmail.com
            </a>{' '}
            and we'll sort it out.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            className="inline-flex items-center justify-center bg-e1-primary text-white hover:bg-[#9f2f0b] rounded-full px-8 py-4 font-semibold text-lg transition-all"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
