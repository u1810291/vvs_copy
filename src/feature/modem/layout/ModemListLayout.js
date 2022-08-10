import React, {useEffect, useMemo} from 'react';
import {generatePath, Link} from 'react-router-dom';

import Listing from '../../../layout/ListingLayout';
import Breadcrumbs from '../../../components/Breadcrumbs';
import withPreparedProps from '../../../hoc/withPreparedProps';

import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../context/auth';
import useAsync from '../../../hook/useAsync';

import {
  chain,
  curry,
  getProp,
  getPropOr,
  identity,
  isArray,
  isEmpty,
  map,
  Maybe,
  not,
  objOf,
  pipe,
  safe
} from 'crocks';
import {alt} from 'crocks/pointfree';
import maybeToAsync from 'crocks/Async/maybeToAsync';

import {ModemEditRoute} from '../routes';
import {ObjectListRoute} from 'feature/object/routes';
import {KeyBoxListRoute} from 'feature/keybox/routes';
import Innerlinks from 'components/Innerlinks';



const getColumn = curry((t, Component, key, pred, mapper) => ({
  Component,
  headerText: t(key),
  key,
  itemToProps: item => pipe(
    getProp(key),
    chain(safe(pred)),
    map(mapper),
    map(objOf('children')),
    map(a => ({...item, ...a})),
    alt(Maybe.Just(item)),
  )(item),
}));

const ne = not(isEmpty);
const Span = props => <span {...props}/>;

const ModemListLayout = withPreparedProps(Listing, props => {
  const {apiQuery} = useAuth();
  const {t: tb} = useTranslation('modem', {keyPrefix: 'breadcrumbs'});
  const {t} = useTranslation('modem', {keyPrefix: 'list.column'});
  const {t: tp} = useTranslation('modem');
  // TODO: Prepare 'Modems' data in Hasura to be fetched
  const [state, fork] = useAsync(chain(maybeToAsync('"modem" prop is expected in the response', getProp('modem')),
    apiQuery(
      `
        query {
          modem {
          
          }
        }
      `
    ))
  );

  const c = useMemo(() => getColumn(t, props => (
    <Link to={generatePath(ModemEditRoute.props.path, {id: props?.id})}>
      {props?.children}
    </Link>
  )), [t]);

  useEffect(() => fork(), []);

  return {
    list: safe(isArray, state.data).option([]),
    rowKeyLens: getPropOr(0, 'id'),
    breadcrumbs: (
      <Breadcrumbs>
        <Breadcrumbs.Item><span className='font-semibold'>{tb`modems`}</span></Breadcrumbs.Item>
        <Breadcrumbs.Item>{tb`allData`}</Breadcrumbs.Item>
      </Breadcrumbs>
    ),
    innerlinks: (
      <Innerlinks>
        <Innerlinks.Item to={ObjectListRoute.props.path}>{tp('Objects')}</Innerlinks.Item>
        <Innerlinks.Item isCurrent={true}>{tp('Modems')}</Innerlinks.Item>
        <Innerlinks.Item to={KeyBoxListRoute.props.path}>{tp('Key Boxes')}</Innerlinks.Item>
      </Innerlinks>
    ),
    // TODO: Adjust column names regarding response data
    tableColumns: [
      c('id', ne, identity),
      c('number', ne, identity),
      c('object_name', ne, identity),
      c('object_number', ne, identity),
      c('contract_number', ne, identity),
      c('status', ne, identity),
    ],
  }
});

export default ModemListLayout;
