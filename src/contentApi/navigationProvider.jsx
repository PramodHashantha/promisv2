import React, { createContext, useMemo, useState } from 'react';

export const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
    const [navigationOpen, setNavigationOpen] = useState(false)
    const [navigationExpend, setNavigationExpend] = useState(false)

    const value = useMemo(
        () => ({
            navigationOpen,
            setNavigationOpen,
            navigationExpend,
            setNavigationExpend,
        }),
        [navigationOpen, navigationExpend]
    )

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
};

export default NavigationProvider