import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type FC,
  type ReactNode,
} from "react";
import { initVimSDK, type VimSDK } from "@vimconnect/app-sdk";

export const VimOSContext = createContext<VimSDK>({} as VimSDK);

export const useVimOsContext = () => {
  return useContext(VimOSContext);
};

export const VimOSContextProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [vimOS, setVimOS] = useState<VimSDK | undefined>(undefined);
  const [error, setError] = useState<Error | undefined>(undefined);
  const disposed = useRef(false);

  useEffect(() => {
    disposed.current = false;
    initVimSDK()
      .then((sdk) => {
        if (!disposed.current) setVimOS(sdk);
      })
      .catch((initError: unknown) => {
        if (disposed.current) return;
        setError(
          initError instanceof Error ? initError : new Error(String(initError))
        );
      });
    return () => {
      disposed.current = true;
    };
  }, []);

  if (error) {
    return <div role="alert">Vim SDK failed to load: {error.message}</div>;
  }

  if (!vimOS) {
    return <div>Loading VimSDK...</div>;
  }

  return (
    <VimOSContext.Provider value={vimOS}>{children}</VimOSContext.Provider>
  );
};
