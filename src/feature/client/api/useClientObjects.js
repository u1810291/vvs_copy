import {createUseWhereList} from 'api/buildApiHook';
import {
  getPropOr, 
  pipe, 
  maybeToAsync,
  tap
} from 'crocks';
import raw from 'raw.macro';

export default createUseWhereList({
  graphQl: raw('./graphql/ObjectsByUserId.graphql'),
  asyncMapFromApi: pipe(
    tap(console.log),
    maybeToAsync('prop \'object_user_rel\' expected but not found.', getPropOr('object_user_rel')),
  ),
});