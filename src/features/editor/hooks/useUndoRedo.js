import { useState, useCallback } from "react";

export const useUndoRedo = (initialPresent) => {
  const [past, setPast] = useState([]);
  const [present, setPresent] = useState(initialPresent);
  const [future, setFuture] = useState([]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;

      const previous = prevPast[prevPast.length - 1];
      const newPast = prevPast.slice(0, prevPast.length - 1);

      setFuture((prevFuture) => [present, ...prevFuture]);
      setPresent(previous);

      return newPast;
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;

      const next = prevFuture[0];
      const newFuture = prevFuture.slice(1);

      setPast((prevPast) => [...prevPast, present]);
      setPresent(next);

      return newFuture;
    });
  }, [present]);

  const set = useCallback(
    (newPresent, overwrite = false) => {
      if (overwrite) {
        setPresent(newPresent);
        return;
      }
      setPast((prevPast) => [...prevPast, present]);
      setPresent(newPresent);
      setFuture([]);
    },
    [present],
  );

  return { state: present, set, undo, redo, canUndo, canRedo };
};
