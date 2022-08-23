import raw from 'raw.macro';
import {Async, pipe, branch, merge, bimap, assign, getProp, safe, chain, option, isObject} from 'crocks';
import {createUseOne} from 'api/buildApiHook';
import {getPathAsync} from 'api/buildUserQuery';
import {removeFalsyFields} from 'util/obj';

export default createUseOne({
  getGraphQl: raw('./graphql/GetDriver.graphql'),
  updateGraphQl: raw('./graphql/UpdateDriver.graphql'),
  createGraphql: raw('./graphql/CreateDriver.graphql'),
  asyncMapFromApi: pipe(
    branch,
    bimap(
      pipe(
        getProp('user_settings_by_pk'),
        chain(safe(isObject)),
        option({}),
      ),
      getPathAsync(['userById', 'user'])
    ),
    merge((l, r) => r.map(assign(l)))
  ),
  asyncMapToApi: pipe(
    removeFalsyFields,
    Async.Resolved,
  ),
});
