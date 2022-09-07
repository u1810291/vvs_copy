import React, {useMemo} from 'react';
import {generatePath, Link, useNavigate} from 'react-router-dom';

import Listing from '../../../layout/ListingLayout';
import Breadcrumbs from '../../../components/Breadcrumbs';
import withPreparedProps from '../../../hoc/withPreparedProps';

import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../context/auth';

import {
  getPropOr,
  identity,
  map,
  Maybe,
  pipe,
  safe,
  and,
  hasProp,
  propSatisfies,
  isTruthy,
  pick,
} from 'crocks';
import {alt} from 'crocks/pointfree';
import Innerlinks from 'components/Innerlinks';
import {HelpListRoute} from 'feature/help/routes';
import DriverOnlineTag from 'feature/driver/component/DriverOnlineTag';
import useClients from '../api/useClients';
import {ClientEditRoute} from '../routes';
import {useFilter} from 'hook/useFilter';
import Button from 'components/Button';
import {FilterIcon} from '@heroicons/react/solid';
import {format} from 'date-fns';
import {useObjectsDropdown} from 'feature/task/api/taskEditApi';
import {ClientCreateRoute} from '../routes';


const ClientListLayout = withPreparedProps(Listing, props => {
  const {apiQuery} = useAuth();
  const {t: tb} = useTranslation('client', {keyPrefix: 'breadcrumbs'});
  const {t: tc} = useTranslation('client', {keyPrefix: 'field'});
  const {t} = useTranslation('client', {keyPrefix: 'list.column'});
  const {t: tp} = useTranslation('client');
  const nav = useNavigate();

  const c = (prop, mapper = identity, status) => ({
    key: prop,
    headerText: tc(prop),
    status,
    itemToProps: item => pipe(
      safe(and(hasProp('id'), propSatisfies(prop, isTruthy))),
      map(item => ({id: item?.id, children: mapper(item?.[prop])})),
      alt(pipe(
        safe(hasProp('id')),
        map(pick(['id'])),
      )(item)),
    )(item),
    Component: ({id, children, fallback = '—'}) => {
      if (!id && !children) return fallback;
      if (!id) return children || fallback;
      return (
        <Link to={generatePath(ClientEditRoute.props.path, {id})}>
          {children || fallback}
        </Link>
      )
    },
  });

  const boolCol = useMemo(() => pipe(String, t), [t]);
  const dateCol = (d) => format(new Date(d), 'Y-MM-dd HH:mm');


  const {data: objectsDropdown} = useObjectsDropdown();
  // console.log(objectsDropdown);

  // TODO: Adjust column names regarding response data
  const tableColumns = [
    c('fullName', identity, true),
    c('contract_no', identity, true),
    c('mobilePhone', identity, true),
    c('username', identity, true),
    c('last_ping', dateCol, true),
    {
      key: 'status',
      headerText: tc`status`,
      itemToProps: Maybe.Just,
      Component: withPreparedProps(DriverOnlineTag, identity),
    }
  ];

  const filtersData = [
    {key: 'fullName', label: 'Name Surname', filter: 'autocomplete', values: []},
    {key: 'username', label: 'Email', filter: 'autocomplete', values: []},
    {key: 'phone', label: 'Phone', filter: 'autocomplete', values: []},
    {key: 'object', label: 'Object', filter: 'autocomplete', values: objectsDropdown || [], displayValue: (v) => {
      const obj = objectsDropdown?.find(o => o.value === v.value);
      return obj?.name ?? obj?.value;
    }},
  ]

  const [queryParams, filters, columns, defaultFilter, toggleFilter] = useFilter(
    'client',
    tableColumns,
    filtersData
  );

  const api = useClients();

  return {
    list: api?.data || [],
    rowKeyLens: getPropOr(0, 'id'),
    breadcrumbs: (
      <Breadcrumbs>
        <Breadcrumbs.Item><span className='font-semibold'>{tb`clients`}</span></Breadcrumbs.Item>
        <Button.NoBg onClick={toggleFilter}>
          {defaultFilter.id ? defaultFilter.name : tb('allData') }
          <FilterIcon className='w-6 h-6 ml-2 text-gray-300 cursor-pointer inline-block focus:ring-0' />
        </Button.NoBg>
      </Breadcrumbs>
    ),
    innerlinks: (
      <Innerlinks>
        <Innerlinks.Item isCurrent={true}>{tp('Clients')}</Innerlinks.Item>
        <Innerlinks.Item to={HelpListRoute.props.path}>{tp('Helps')}</Innerlinks.Item>
      </Innerlinks>
    ),
    buttons: (
      <>
        <Button onClick={() => nav(ClientCreateRoute.props.path)}>{tp('create')}</Button>
      </>
    ),
    tableColumns,
    columns,
    filters,
  }
});

export default ClientListLayout;
