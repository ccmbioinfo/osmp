import { useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';

type UserInfo = {
    email_verified: boolean;
    preferred_username: string;
    sub: string;
};

const useUserInfo = <T extends UserInfo>() => {
    const {
        keycloak: { loadUserInfo },
        initialized,
    } = useKeycloak();

    const [userInfo, setUserInfo] = useState<{}>();

    console.log(userInfo);

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
