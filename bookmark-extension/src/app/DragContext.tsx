// import React, { createContext, useContext, useMemo, useState } from 'react';

// type DragState = {
//   draggingId: string | null;
//   setDraggingId: (id: string | null) => void;

//   hoveredId: string | null;
//   setHoveredId: (id: string | null) => void;

//   canDrop: (targetId: string) => boolean;
// };

// const DragContext = createContext<DragState | null>(null);

// export function DragProvider({ children }: { children: React.ReactNode }) {
//   const [draggingId, setDraggingId] = useState<string | null>(null);
//   const [hoveredId, setHoveredId] = useState<string | null>(null);

//   const value = useMemo(() => {
//     return {
//       draggingId,
//       setDraggingId,
//       hoveredId,
//       setHoveredId,

//       canDrop: (targetId: string) => {
//         if (!draggingId) return false;
//         if (draggingId === targetId) return false;
//         return true;
//       },
//     };
//   }, [draggingId, hoveredId]);

//   return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
// }

// export function useDragState() {
//   const ctx = useContext(DragContext);
//   if (!ctx) {
//     throw new Error('useDragState must be used within <DragProvider>');
//   }
//   return ctx;
// }

import React, { createContext, useContext, useMemo, useState } from 'react';

type DragState = {
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;

  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;

  canDrop: (targetId: string) => boolean;
};

const DragContext = createContext<DragState | null>(null);

export function DragProvider({ children }: { children: React.ReactNode }) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const value = useMemo(() => {
    return {
      draggingId,
      setDraggingId,
      hoveredId,
      setHoveredId,

      canDrop: (targetId: string) => {
        if (!draggingId) return false;
        if (draggingId === targetId) return false;
        return true;
      },
    };
  }, [draggingId, hoveredId]);

  return <DragContext.Provider value={value}>{children}</DragContext.Provider>;
}

export function useDragState() {
  const ctx = useContext(DragContext);
  if (!ctx) {
    throw new Error('useDragState must be used within <DragProvider>');
  }
  return ctx;
}
