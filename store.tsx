import React from "react";
import { createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import reducers from "@reducers";
import { ReducersType } from "@enums/reducers";
import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

const persistConfig = {
  key: "synth",
  storage,
  blacklist: ["selectedTrack", "midiDevice", "loadedMidi"]
};

const persistedReducer = persistReducer(persistConfig, reducers);

// Transform actions-type to a string if the action type is a
// number and there's we defined an actiontype for that.
// Else, use the unsanitized action as normal. The reason
// for the checks is to escape dispatched actions from
// packages like react-router or redux-form.
const actionTypeEnumToString = (action: any): any =>
  typeof action.type === "number" && ReducersType[action.type]
    ? {
        type: ReducersType[action.type],
        payload: action.payload
      }
    : action;

export function initializeStore(initialState = {}) {
  return createStore(
    persistedReducer,
    initialState,
    composeWithDevTools({ actionSanitizer: actionTypeEnumToString })()
  );
}

const isServer = typeof window === "undefined";
const __NEXT_REDUX_STORE__ = "__NEXT_REDUX_STORE__";

function getOrCreateStore(initialState?) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return initializeStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = initializeStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      // Get or Create the store with `undefined` as initialState
      // This allows you to set a custom default initialState
      const reduxStore = getOrCreateStore();

      // Provide the store to getInitialProps of pages
      appContext.ctx.reduxStore = reduxStore;

      let appProps = {};
      if (typeof App.getInitialProps === "function") {
        appProps = await App.getInitialProps.call(App, appContext);
      }

      return {
        ...appProps,
        initialReduxState: reduxStore.getState()
      };
    }

    reduxStore: any;

    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />;
    }
  };
};
