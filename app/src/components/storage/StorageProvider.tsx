import type { PreferencesPlugin } from "@capacitor/preferences";
import type { SecureStoragePlugin } from "capacitor-secure-storage-plugin";
import { useCallback, useEffect, useReducer } from "react";

export type StorageSystem = PreferencesPlugin | typeof SecureStoragePlugin;

type UseStateHook<T> = [[boolean, T | null], (value: T | null) => void];

function useAsyncState<T>(
  initialValue: [boolean, T | null] = [true, null],
): UseStateHook<T> {
  return useReducer(
    (
      _state: [boolean, T | null],
      action: T | null = null,
    ): [boolean, T | null] => [false, action],
    initialValue,
  ) as UseStateHook<T>;
}

export async function setStorageItemAsync(
  key: string,
  value: string | null,
  storage: StorageSystem,
) {
  if (value == null) {
    await storage.remove({ key });
  } else {
    await storage.set({ key, value });
  }
}

export function useStorageState(
  key: string,
  storage: StorageSystem,
): UseStateHook<string> {
  const [state, setState] = useAsyncState<string>();

  useEffect(() => {
    storage.get({ key }).then(({ value }) => {
      setState(value);
    });
  }, [key, setState, storage]);

  const setValue = useCallback(
    (value: string | null) => {
      setState(value);
      setStorageItemAsync(key, value, storage);
    },
    [key, setState, storage],
  );

  return [state, setValue];
}