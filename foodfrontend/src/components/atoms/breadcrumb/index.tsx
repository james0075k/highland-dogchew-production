import React from 'react';
import Link from 'next/link';

interface BreadcrumbProps {
  currentnavlink: string;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ currentnavlink }) => {
  const paths = currentnavlink.split('/');
  const fullPaths: string[] = [];

  paths.forEach((_, i) => {
    fullPaths.push('/' + paths.slice(0, i + 1).join('/').toLowerCase());
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-light-beige w-full relative z-40 top-15 md:top-20 shadow-sm mb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <div className="text-sm md:text-base font-semibold flex flex-wrap items-center gap-1 sm:gap-2">
          <Link href="/" className="text-gray-400 hover:text-gray-600">
            Home
          </Link>

          {paths.map((segment, i) => (
            <React.Fragment key={i}>
              <span className="text-gray-400 mx-0.5">&raquo;</span>
              {i < paths.length - 1 ? (
                <Link
                  href={fullPaths[i]}
                  className="text-gray-400 hover:text-gray-600 capitalize"
                >
                  {segment}
                </Link>
              ) : (
                <span className="text-black capitalize">{segment}</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Breadcrumb;
