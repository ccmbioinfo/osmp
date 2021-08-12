import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

const useUserInfo = <T extends {}>() => {
    const {
        keycloak: { loadUserInfo },
        initialized,
    } = useKeycloak();

    const [userInfo, setUserInfo] = useState<{}>();

    useEffect(() => {
        (async () => {
            if (initialized && !Object.keys(userInfo || {}).length) {
                setUserInfo(await loadUserInfo());
            }
        })();
    }, [userInfo, initialized, loadUserInfo]);

    return userInfo as T;
};

export default useUserInfo;
