import { useState, useEffect } from "react";

function useLocalStorage(
    key: string,
    initialValue: string | null | undefined
): [
    string | null | undefined,
    (
        value:
            | string
            | null
            | undefined
            | ((val: string | null | undefined) => string | null | undefined)
    ) => void,
] {
    // State to store the value
    // Pass initial value to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<string | null | undefined>(
        () => {
            try {
                if (typeof window === "undefined") {
                    return initialValue;
                }
                // Get from local storage by key
                const item = window.localStorage.getItem(key);
                // Return stored value or if none return initialValue
                return item ? item : initialValue;
            } catch (error) {
                // If error also return initialValue
                console.error(error);
                return initialValue;
            }
        }
    );

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (
        value:
            | string
            | null
            | undefined
            | ((val: string | null | undefined) => string | null | undefined)
    ) => {
        try {
            if (typeof window === "undefined") {
                return;
            }
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            if (valueToStore === null || valueToStore === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, valueToStore);
            }
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.error(error);
        }
    };

    useEffect(() => {
        //If run in SSR, skip setItem
        if (typeof window === "undefined") {
            return;
        }

        try {
            if (storedValue === null || storedValue === undefined) {
                window.localStorage.removeItem(key);
            } else {
                window.localStorage.setItem(key, storedValue);
            }
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}

function useLocalStorageJSON<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
    // State to store the value
    // Pass initial value to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            if (typeof window === "undefined") {
                return initialValue;
            }
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            if (typeof window === "undefined") {
                return;
            }
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            // A more advanced implementation would handle the error case
            console.error(error);
        }
    };

    useEffect(() => {
        //If run in SSR, skip setItem
        if (typeof window === "undefined") {
            return;
        }

        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}

function fetchLocalStorageJSON<T>(key: string, initialValue: T): T {
    if (typeof window === "undefined") {
        return initialValue;
    }
    // Get from local storage by key
    const item = window.localStorage.getItem(key);
    // Parse stored json or if none return initialValue
    return item ? JSON.parse(item) : initialValue;
}

function fetchLocalStorage(
    key: string,
    initialValue: string | null | undefined = null
): string | null | undefined {
    if (typeof window === "undefined") {
        return initialValue;
    }
    // Get from local storage by key
    const item = window.localStorage.getItem(key);
    // Return stored value or if none return initialValue
    return item ? item : initialValue;
}

export {
    useLocalStorage,
    fetchLocalStorage,
    useLocalStorageJSON,
    fetchLocalStorageJSON,
};
