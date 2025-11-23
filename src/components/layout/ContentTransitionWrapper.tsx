"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

type Props = {
  children: ReactNode;
};

/**
 * Smooth content transition wrapper - only transitions page content, not navbar/footer
 */
export function ContentTransitionWrapper({ children }: Props) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);
    
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      className="transition-opacity duration-150 ease-in-out"
      style={{
        opacity: isTransitioning ? 0.8 : 1,
      }}
    >
      {children}
    </div>
  );
}

