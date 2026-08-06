import { useCallback, useState } from 'react';

export function reorderArray<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return items;
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export interface DragReorderHandlers {
  dragIndex: number | null;
  overIndex: number | null;
  onDragStart: (index: number) => (e: React.DragEvent) => void;
  onDragOver: (index: number) => (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (index: number) => (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

export function useDragReorder(
  onReorder: (fromIndex: number, toIndex: number) => void,
): DragReorderHandlers {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const onDragStart = useCallback(
    (index: number) => (e: React.DragEvent) => {
      setDragIndex(index);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', String(index));
    },
    [],
  );

  const onDragOver = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOverIndex(index);
    },
    [],
  );

  const onDragLeave = useCallback(() => {
    setOverIndex(null);
  }, []);

  const onDrop = useCallback(
    (index: number) => (e: React.DragEvent) => {
      e.preventDefault();
      const from = dragIndex ?? Number(e.dataTransfer.getData('text/plain'));
      if (!Number.isNaN(from) && from !== index) {
        onReorder(from, index);
      }
      setDragIndex(null);
      setOverIndex(null);
    },
    [dragIndex, onReorder],
  );

  const onDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  return { dragIndex, overIndex, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd };
}
