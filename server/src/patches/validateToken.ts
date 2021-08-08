import crypto from 'crypto';
import { GrantManager, Token } from 'keycloak-connect';

/*
   monkeypatch for dockerized environments in which front-end keycloak and backend keycloak host differ
   specifically, removes token.content.iss !== this.realmUrl check (grant-manager.js:430)
   use of typescript `any` due to fact that only external API is typed
*/
const validateToken = function (
  this: GrantManager,
  token: Token,
  expectedType: string | undefined
): Promise<Token> {
  return new Promise((resolve, reject) => {
    if (!token) {
      reject(new Error('invalid token (missing)'));
    } else if (token.isExpired()) {
      reject(new Error('invalid token (expired)'));
    } else if (!(token as any).signed) {
      reject(new Error('invalid token (not signed)'));
    } else if ((token as any).content.typ !== expectedType) {
      reject(new Error('invalid token (wrong type)'));
    } else if ((token as any).content.iat < (this as any).notBefore) {
      reject(new Error('invalid token (stale token)'));
    } else {
      const audienceData = Array.isArray((token as any).content.aud)
        ? (token as any).content.aud
        : [(token as any).content.aud];
      if (expectedType === 'ID') {
        if (!audienceData.includes((this as any).clientId)) {
          reject(new Error('invalid token (wrong audience)'));
        }
        if ((token as any).content.azp && (token as any).content.azp !== (this as any).clientId) {
          reject(new Error('invalid token (authorized party should match client id)'));
        }
      } else if ((this as any).verifyTokenAudience) {
        if (!audienceData.includes((this as any).clientId)) {
          reject(new Error('invalid token (wrong audience)'));
        }
      }
      const verify = crypto.createVerify('RSA-SHA256');
      // if public key has been supplied use it to validate token
      if ((this as any).publicKey) {
        try {
          verify.update((token as any).signed);
          if (!verify.verify((this as any).publicKey, (token as any).signature, 'base64')) {
            reject(new Error('invalid token (signature)'));
          } else {
            resolve(token);
          }
        } catch (err) {
          reject(
            new Error(
              'Misconfigured parameters while validating token. Check your keycloak.json file!'
            )
          );
        }
      } else {
        // retrieve public KEY and use it to validate token
        (this as any).rotation
          .getJWK((token as any).header.kid)
          .then((key: any) => {
            verify.update((token as any).signed);
            if (!verify.verify(key, (token as any).signature)) {
              reject(new Error('invalid token (public key signature)'));
            } else {
              resolve(token);
            }
          })
          .catch((err: any) => {
            reject(new Error('failed to load public key to verify token. Reason: ' + err.message));
          });
      }
    }
  });
};

export default validateToken;
