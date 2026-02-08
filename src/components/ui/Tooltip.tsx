/**
 * Tooltip wrapper component
 * Shows a custom CSS tooltip on hover (web only, instant display).
 * On native, renders children without tooltip.
 */

import React, { useId } from 'react';

interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();

  // CSS class names derived from useId (strip colons for valid CSS)
  const wrapperId = `tooltip-${id.replace(/:/g, '')}`;

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #${wrapperId} {
              position: relative;
            }
            #${wrapperId}::after {
              content: attr(data-tooltip);
              position: absolute;
              top: calc(100% + 6px);
              right: 0;
              padding: 4px 10px;
              border-radius: 6px;
              font-size: 12px;
              line-height: 1.4;
              white-space: nowrap;
              pointer-events: none;
              opacity: 0;
              transition: opacity 0.15s;
              background: rgba(0, 0, 0, 0.8);
              color: #fff;
              z-index: 1000;
            }
            #${wrapperId}:hover::after {
              opacity: 1;
            }
          `,
        }}
      />
      <div id={wrapperId} data-tooltip={label}>
        {children}
      </div>
    </>
  );
}
