/* ==========================================================================
   DCARD V71 — FIREBASE INITIALIZATION (Compat v10, works on GitHub Pages)
   ========================================================================== */
(function () {
  "use strict";

  const firebaseConfig = {
    apiKey: "AIzaSyCqOAHwls2LyCL0i9sd9m3o5NPNtkNg7Y0",
    authDomain: "dcard-2c988.firebaseapp.com",
    databaseURL: "https://dcard-2c988-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "dcard-2c988",
    storageBucket: "dcard-2c988.firebasestorage.app",
    messagingSenderId: "131419072292",
    appId: "1:131419072292:web:a943ea24485f7a206935b1"
  };

  window.DCARD_FIREBASE_CONFIG = firebaseConfig;

  const state = {
    ok: false,
    app: null,
    auth: null,
    db: null,
    user: null,
    uid: null,
    isGoogle: false,
    error: null,
    _readyResolvers: [],
    whenReady() {
      if (this.uid) return Promise.resolve(this);
      if (this.error && !this.auth) return Promise.resolve(this);
      return new Promise((resolve) => {
        this._readyResolvers.push(resolve);
        setTimeout(() => resolve(this), 8000);
      });
    },
    _flushReady() {
      while (this._readyResolvers.length) {
        const fn = this._readyResolvers.shift();
        try { fn(this); } catch (_) {}
      }
    }
  };

  window.DCARD_FB = state;

  function bootFirebase() {
    if (typeof firebase === "undefined" || !firebase.initializeApp) {
      state.error = "Firebase SDK не завантажено (офлайн режим)";
      state._flushReady();
      return;
    }
    try {
      state.app = firebase.apps && firebase.apps.length
        ? firebase.app()
        : firebase.initializeApp(firebaseConfig);
      state.auth = firebase.auth();
      state.db = firebase.database();
      state.ok = true;

      state.auth.onAuthStateChanged((user) => {
        if (user) {
          state.user = user;
          state.uid = user.uid;
          state.isGoogle = !user.isAnonymous && (user.providerData || []).some(p => p.providerId === "google.com");
          state._flushReady();
          window.dispatchEvent(new CustomEvent("dcard:auth", { detail: state }));
        } else {
          state.auth.signInAnonymously().catch((err) => {
            console.warn("[DCARD_FB] Anonymous sign-in failed:", err);
            state.error = err && err.message ? err.message : "Auth error";
            state._flushReady();
          });
        }
      });
    } catch (err) {
      console.warn("[DCARD_FB] Init error:", err);
      state.error = err && err.message ? err.message : "Init error";
      state._flushReady();
    }
  }

  bootFirebase();
})();
