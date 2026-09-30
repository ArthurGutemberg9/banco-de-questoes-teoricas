import type { FirebaseApp } from "firebase/app";
import { UserVisibleError } from "./errors";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim() ?? "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim() ?? "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim() ?? "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim() ?? "",
};

export const firebaseConfigured = Object.values(config).every(Boolean);

let firebaseAppPromise: Promise<FirebaseApp> | null = null;
let anonymousUserPromise: Promise<string> | null = null;

export function getFirebaseApp(): Promise<FirebaseApp> {
  if (!firebaseConfigured) {
    return Promise.reject(new Error("O Firebase ainda não está configurado neste aplicativo."));
  }
  if (!firebaseAppPromise) {
    firebaseAppPromise = import("firebase/app").then(({ getApp, getApps, initializeApp }) =>
      getApps().length > 0 ? getApp() : initializeApp(config),
    );
  }
  return firebaseAppPromise;
}

export function ensureAnonymousUser(): Promise<string> {
  if (!firebaseConfigured) {
    return Promise.reject(new Error("O Firebase ainda não está configurado neste aplicativo."));
  }
  if (!anonymousUserPromise) {
    anonymousUserPromise = (async () => {
      const app = await getFirebaseApp();
      const { getAuth, onAuthStateChanged, signInAnonymously } = await import("firebase/auth");
      const firebaseAuth = getAuth(app);
      if (firebaseAuth.currentUser) {
        if (!firebaseAuth.currentUser.isAnonymous) {
          throw new UserVisibleError("Já existe uma conta Firebase conectada neste navegador. Para este caderno, use uma sessão anônima ou abra outro perfil do navegador.");
        }
        return firebaseAuth.currentUser.uid;
      }

      return new Promise<string>((resolve, reject) => {
        let unsubscribe: () => void = () => {};
        let signInStarted = false;
        unsubscribe = onAuthStateChanged(
          firebaseAuth,
          (user) => {
            if (user) {
              unsubscribe();
              if (!user.isAnonymous) {
                reject(new UserVisibleError("Já existe uma conta Firebase conectada neste navegador. Para este caderno, use uma sessão anônima ou abra outro perfil do navegador."));
                return;
              }
              resolve(user.uid);
              return;
            }
            if (!signInStarted) {
              signInStarted = true;
              void signInAnonymously(firebaseAuth)
                .then((credential) => {
                  unsubscribe();
                  resolve(credential.user.uid);
                })
                .catch((error: unknown) => {
                  unsubscribe();
                  reject(error);
                });
            }
          },
          (error) => {
            unsubscribe();
            reject(error);
          },
        );
      });
    })().finally(() => {
      anonymousUserPromise = null;
    });
  }
  return anonymousUserPromise;
}
