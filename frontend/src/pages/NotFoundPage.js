import { Link } from 'react-router-dom';

/**
 * NotFoundPage — catch-all for unknown routes. Keeps visitors in the funnel
 * by pointing at Book, Join, and Home instead of a blank page.
 */
export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-e1-bg text-e1-text flex items-center justify-center px-6 pt-32 pb-16">
      <div className="max-w-2xl text-center">
        <p className="font-sans text-e1-text-muted uppercase tracking-wider text-sm mb-4">
          404
        </p>
        <h1 className="font-display text-4xl md:text-6xl leading-tight mb-6">
          That page isn't here.
        </h1>
        <p className="font-sans text-e1-text-muted text-lg mb-10 max-w-xl mx-auto">
          The link may be stale or the page has moved. Pick up where the
          Movement is happening:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-text-muted text-e1-text hover:bg-e1-text hover:text-e1-bg transition-colors rounded-full"
          >
            Home
          </Link>
          <Link
            to="/book"
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-primary text-e1-primary hover:bg-e1-primary hover:text-e1-text transition-colors rounded-full"
          >
            Buy the Book
          </Link>
          <Link
            to="/join"
            className="font-sans uppercase text-sm tracking-wider px-8 py-4 border border-e1-text-muted text-e1-text-muted hover:bg-e1-text-muted hover:text-e1-bg transition-colors rounded-full"
          >
            Join a Circle
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
