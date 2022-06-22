import React, {useCallback, useEffect, useMemo, useState} from 'react';
import refresh from 'feature/login/api/refresh';
import useMergeReducer from 'hook/useMergeReducer';
import {api, apiQuery} from 'api';
import {createContext, useContext} from 'react';
import {
  and,
  chain,
  getProp,
  isEmpty,
  isString,
  map,
  not,
  objOf,
  option,
  pipe,
  safe,
  tap,
} from 'crocks';

const AuthContext = createContext();
const isValid = and(isString, not(isEmpty));

const AuthContextProvider = ({children}) => {
  const [isAuthorized, setAuthorized] = useState(null);
  const [state, setState] = useMergeReducer({
    token: null,
    refreshToken: null
  });

  const authorizedApi = useMemo(() => pipe(
    getProp('token'),
    chain(safe(isValid)),
    map(pipe(
      str => `Bearer ${str}`,
      objOf('Authorization'),
      api
    )),
    option(apiQuery)
  )(state), [state]);

  const fail = useCallback(() => {
    setAuthorized(false);
    setState({token: null, refreshToken: null});
  }, [setAuthorized, setState]);

  const success = useCallback(() => {
    setAuthorized(true);
  }, [setAuthorized])

  useEffect(() => {
    const refreshtoken = (
      getProp('refreshToken', state)
      .chain(safe(isValid))
      .map(tap(value => localStorage.setItem('refreshToken', value)))
      .alt(safe(isValid, localStorage.getItem('refreshToken')))
      .either(fail, refreshToken => {
        if (state.token) return success();

        refresh(refreshToken)
          .map(tap(setState))
          .fork(fail, success)
      })
    );
  }, [state, fail, success]);

  return (
    <AuthContext.Provider value={{
      ...state,
      isAuthorized,
      update: setState,
      api: authorizedApi,
      apiQuery: authorizedApi(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @type {() => {
 * isAuthorized: bool,
 * update: (newState: object) => void
 * api: (variables: object) => (query: string) => Async
 * apiQuery: (query: string) => Async
 * }}
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within a AuthProvider');
  return context;
}

export {
  AuthContextProvider,
  useAuth,
}
