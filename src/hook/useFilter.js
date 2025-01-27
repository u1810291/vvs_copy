import {onInputEventOrEmpty} from '@s-e/frontend/callbacks/event/input';
import {useEffect, useMemo, useReducer, useState, useCallback} from 'react';
import Button from 'components/Button';
import Nullable from 'components/atom/Nullable';
import {format} from 'date-fns';
import {generate} from 'shortid';
import DatePicker from 'components/DatePicker';
import {DocumentDownloadIcon, StarIcon} from '@heroicons/react/solid';
import {useSearchParams} from 'react-router-dom';
import InputGroup from 'components/atom/input/InputGroup';
import CheckBox from 'components/atom/input/CheckBox';
import Filter from 'components/Filter';
import {renderWithProps} from 'util/react';
import SelectBox from 'components/atom/input/SelectBox';
import ComboBox from 'components/atom/input/ComboBox';
import {unflatten} from 'util/obj';
import {exportTableToExcel} from 'util/utils';
import {
  hasProps,
  isArray,
  isFunction,
  map,
  option,
  pipe,
  safe,
} from 'crocks';
import {useTranslation} from 'react-i18next';

const LS_KEY_NAME = 'listingFilters';
const DEFAULT_FILTER_NAME = 'New filter';
const DEFAULT_SHORTCUT_NAME = 'FLTR';
const APPLY_FILTER_PARAM = 'af';
const SHORTCUT_MAXLENGTH = 4;
const DIRECTION_ASC = 'asc_nulls_first';
const DIRECTION_DESC = 'desc_nulls_first';

const Mode = {
  Default: 'default',
  Create: 'create',
  Edit: 'edit',
}

const updater = (state, action) => {
  const prevState = {...state};

  switch (action.type) {
    case 'TEXT':
      if (action.value) {
        prevState[action.key] = `%${action.value}%`;
      } else {
        delete prevState[action.key];
      }
  
      return {...prevState};

    case 'DATE':
      if (action.value) {
        const year = action.value.getFullYear();
        const month = action.value.getMonth();
        const day = action.value.getDate();

        // prevState[`${action.key}`] = `${format(new Date(year, month, day, 0, 0, 0), 'Y-MM-dd\'T\'HH:mm:ss.SSSXXX')}`;
        prevState[`${action.key}_start`] = `${format(new Date(year, month, day, 0, 0, 0), 'Y-MM-dd\'T\'HH:mm:ss.SSSXXX')}`;
        prevState[`${action.key}_end`] = `${format(new Date(year, month, day, 23, 59, 59), 'Y-MM-dd\'T\'HH:mm:ss.SSSXXX')}`;
      } else {
        // delete prevState[`${action.key}`];
        delete prevState[`${action.key}_start`];
        delete prevState[`${action.key}_end`];
      }

      return {...prevState};
    
    case 'DATERANGE':
      if (action.value) {          
        const year = action.value.getFullYear();
        const month = action.value.getMonth();
        const day = action.value.getDate();

        if (`${action.key}_start` in prevState) {
          prevState[`${action.key}_end`] = `${format(new Date(year, month, day, 23, 59, 59), 'Y-MM-dd\'T\'HH:mm:ss.SSSXXX')}`;
        } else {

          prevState[`${action.key}_start`] = `${format(new Date(year, month, day, 0, 0, 0), 'Y-MM-dd\'T\'HH:mm:ss.SSSXXX')}`;
        }
      } else {
        delete prevState[`${action.key}_start`];
        delete prevState[`${action.key}_end`];
      }

      return {...prevState};
    case 'RANGE':
      if (action.value) {
        prevState[action.key] = action.value;
      } else {
        delete prevState[action.key];
      }

      return {...prevState}

    case 'SELECT':
      if (!(action.key in prevState)) {
        prevState[action.key] = action.value;
      } else {
        if (prevState[action.key].value === action.value) {
          delete prevState[action.key];
        } else {
          prevState[action.key] = action.value;
        }
      }
  
      return {...prevState};

    case 'MULTISELECT':
    case 'AUTOCOMPLETE':
      if (!(action.key in prevState)) {
        prevState[action.key] = [action.value];
      } else {
        let exists = prevState[action.key].find(s => s === action.value);
  
        if (exists) {
          prevState[action.key] = [
            ...prevState[action.key].filter(s => s !== action.value)
          ];
        } else {
            prevState[action.key] = [...prevState[action.key], action.value];
        }
      }

      if (prevState[action.key].length == 0) delete prevState[action.key];

      return {...prevState};    

    case 'APPLY':
      return {...action.filter};

    default:
      return state;
  }
}

const prepInitials = (filters) => {
  const initials = {};

  filters.map(f => {
    if (f?.initial) {
      initials[f.key] = f.initial;
    }
  });

  return initials;
}

const getAllFilters = () => {
  return JSON.parse(localStorage.getItem(LS_KEY_NAME)) ?? {};
}

const getSavedFilters = (tableName) => {
  const all = getAllFilters();
  return tableName in all ? all[tableName] : [];
}

export const getStarredFilters = () => {
  const allSaved = getAllFilters();
  const onlyStarred = [];

  for (const key in allSaved) {
    allSaved[key].map(f => {
      if (f.starred) {
        onlyStarred.push(f);
      }
    })
  }

  return onlyStarred;
}

const getDefaultFilterId = (filters) => {
  if (!filters) return null;

  const defaultFilter = filters.find(f => f.isDefault === true);
  return defaultFilter ? defaultFilter.id : null;
}

export const useFilter = (tableName, tableColumns, filtersData, filterOptions, initialState, customFilter) => {
  const {t} = useTranslation('filter');
  const [exportData, setExportData] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const [state, dispatch] = useReducer(updater, initialState ?? prepInitials(filtersData));
  const [params] = useSearchParams();
  const [savedFilters, setSavedFilters] = useState(getSavedFilters(tableName)); // TODO: is this a heavy operation? maybe 'useMemo'...
  const [defaultFilterId, setDefaultFiterId] = useState(getDefaultFilterId(savedFilters));
  const [mode, setMode] = useState(Mode.Default);
  const [formState, setFormState] = useState({
    id: null,
    title: null,
    shortcut: null,
    starred: false,
    isDefault: false,
  })
  const [hideArchived, setHideArchived] = useState(true);

  const [sortColumnKey, setSortColumnKey] = useState(tableColumns.length > 0 ? `-${tableColumns[0].key}` : null);
  const setSortColumn = (column) => {
    setSortColumnKey(sortColumnKey && sortColumnKey === column ? `-${column}` : column);
  }

  
  const handleExport = useCallback(() => exportTableToExcel(exportData, new Date()), [exportData]);
  const search = useCallback(() => dispatch({action: 'SEARCH'}), [state]);

  const [columns, setColumns] = useState([]);

  useEffect(() => {
    if (params.get(APPLY_FILTER_PARAM)) {
      applyFilter(params.get(APPLY_FILTER_PARAM));
      return;
    }

    applyFilter(defaultFilterId);
  }, []);

  useEffect(() => {
    if (params.get(APPLY_FILTER_PARAM)) {
      applyFilter(params.get(APPLY_FILTER_PARAM));
    }
  }, [params]);

  useEffect(() => {
    saveToStorage();
  }, [savedFilters]);

  const pickedColumns = useMemo(() => pipe(
    safe(isArray),
    map(map(pipe(
      safe(hasProps(['headerText', 'key'])),
      map(a => ({
        uid: a.key,
        key: a.key,
        active: a.status ?? false,
        children: a.headerText,
      })),
      map(renderWithProps(Filter.Item)),
      option(null),
    ))),
    option(null)
  )(tableColumns), [tableColumns]);

  const saveToStorage = () => {
    const allSaved = getAllFilters();
    allSaved[tableName] = savedFilters;
    localStorage.setItem(LS_KEY_NAME, JSON.stringify(allSaved));
    
    window.dispatchEvent(new Event('storage'))
  }

  // can save filter
  const canSave = () => {
    let canSave = false;

    for (const [key, value] of Object.entries(state)) {
      if (value !== undefined || value !== null) {
        canSave = true;
        break;
      }
    }
    
    return canSave;
  }

  // toggle filter
  const toggleFilter = () => {
    setShowFilter(() => !showFilter);
  }

  // get filter
  const getFilter = (id) => {
    if (!id) return {id: undefined};
    return savedFilters.find(f => f.id === id);
  }

  // update filter
  const updateFilter = (id, prop, value) => {
    const newFilters = [...savedFilters];

    newFilters.map(f => {
      if (f.id === id) {
        f[prop] = value;
      }
    })

    setSavedFilters(newFilters);
  }

  // delete filter
  const deleteFilter = () => {
    if (!confirm('Are you sure you want to delete?')) {
      return;
    }

    const id = formState.id;
    const newFilters = savedFilters.filter(f => f.id !== id);
    
    setSavedFilters(newFilters);

    if (defaultFilterId === id) {
      resetFilter();
    }

    setFormState({
      id: null,
      title: null,
      shortcut: null,
      starred: false,
      isDefault: false,
    });

    setMode(Mode.Default);
  }


  // star filter
  const starFilter = (e) => {
    const id = e.currentTarget.id;
    const filter = getFilter(id);

    updateFilter(id, 'starred', !filter.starred);
  }

  // on filter name changed
  const onFilterNameChanged = (e) => {
    if (e.key !== 'Enter') return;

    const id = e.target.id;
    const newName = e.target.value;

    updateFilter(id, 'name', newName);
    updateFilter(id, 'editMode', false);
  }

  // blur
  const onFilterBlur = (e) => {
    const id = e.target.id;
    updateFilter(id, 'editMode', false);
  }

  const onFilterFocus = (e) => {
    const id = e.target.id;
    updateFilter(id, 'editMode', true);
  }

  // apply filter
  const applyFilter = (id) => {
    // default 'all data' filter
    if (!id) {
      resetFilter();
      return;
    }
    
    const filter = getFilter(id);

    if (!filter) {
      resetFilter();
      return;
    }

    // set selected & apply new state
    setDefaultFiterId(id);
    dispatch({type: 'APPLY', filter: {...filter.props.state}});
  }
  
  const onFilterApply = (e) => {
    const id = e.currentTarget.id;
    applyFilter(id);
  }

  const resetFilter = () => {
    setDefaultFiterId(null);
    dispatch({type: 'APPLY', filter: initialState ?? prepInitials(filtersData)});
  }

  const onModeCreate = () => {
    if (!canSave()) return;
    setMode(Mode.Create);
  }

  const onModeEdit = (e) => {
    const id = e.target.id;
    const filter = getFilter(id);

    setFormState({
      id: filter.id,
      title: filter.name,
      shortcut: filter.shortcut,
      starred: filter.starred,
      isDefault: filter.isDefault,
    })

    updateFilter(id, 'editMode', false);

    setMode(Mode.Edit);
  }

  const onModeCancel = () => {
    if (formState.id) {
      updateFilter(formState.id, 'editMode', false);

      setFormState({
        id: null,
        title: null,
        shortcut: null,
        starred: false,
        isDefault: false,
      })
    }

    setMode(Mode.Default);
  }

  const onSaveFilterShortcut = (e) => {
    const id = e.target.id;

    updateFilter(id, 'props', {
      tableName,
      // query,
      filtersData,
      state 
    });
  }

  const onFilterSave = () => {
    // TODO: validation
    if (!formState.title || !formState.shortcut) {
      alert('Provide filter\'s title & shortcut names');
      return;
    }

    // we are editing filter
    if (formState.id) {
      updateFilter(formState.id, 'name', formState.title);
      updateFilter(formState.id, 'shortcut', formState.shortcut);
      updateFilter(formState.id, 'starred', formState.starred);
      updateFilter(formState.id, 'props', {
        tableName,
        // query,
        filtersData,
        state 
      });
      updateFilter(formState.id, 'editMode', false);
      updateFilter(formState.id, 'isDefault', formState.isDefault);

      // if default or no more default -> All data
      if (formState.isDefault) {
        savedFilters.map(f => {
          if (f.id !== formState.id) {
            updateFilter(f.id, 'isDefault', false);  
          }
        })
      }

      setFormState({
        id: null,
        title: null,
        shortcut: null,
        starred: false,
        isDefault: false,
      })

      setMode(Mode.Default);
      return;
    }

    // create a new filter
    const id = generate();
    const newFilter = {
      id,
      name: formState.title || DEFAULT_FILTER_NAME,
      shortcut: formState.shortcut || DEFAULT_SHORTCUT_NAME,
      starred: formState.starred,   // ???
      isDefault: formState.isDefault,
      url: `${window.location.pathname}?${APPLY_FILTER_PARAM}=${id}`,  // will not work in Next.js SSR
      editMode: false,
      props: {
        tableName,
        // query,
        filtersData,
        state 
      }
    }
      
    // TODO: make if default
    if (newFilter.isDefault) {
      newFilters.map(f => {
        if (f.id !== id) {
          updateFilter(f.id, 'isDefault', false);  
        }
      })
    }

    const newFilters = [...savedFilters, newFilter];
    
    setSavedFilters(newFilters);
    setMode(Mode.Default);
    setDefaultFiterId(id);  // shoult it be named selectedFilterId ?
  }

  // on user input changed
  const handleUserInput = (e) => {
    const name = e.target.name;
    const value = ['title', 'shortcut'].includes(name) ? e.target.value : e.target.checked;

    setFormState({
      ...formState, [name]: value
    });
  }



  // TODO: move out into separate Component
  const filters = useMemo(() => {
    return (
      <div className={showFilter ? 'visible w-full' : 'hidden'}>
        <div className='w-full flex flex-row columns-3 border-t-2 border-gray-200'>
          {/* saved filters zone */}
          <div className='w-1/5 min-w-[240px] max-h-[300px] overflow-y-auto '>
            {mode === Mode.Default &&
              <div className='flex flex-col divide-y divide-slate-200'>
                <div className='flex flex-row  border-gray-300  '>
                  <div onClick={resetFilter} className={`${!defaultFilterId ? 'border-blue-700 border-r-4' : ''} flex w-full  hover:opacity-50 cursor-pointer px-6 py-2`}>
                    All Data
                  </div>
                </div>

                <Nullable on={savedFilters.length > 0}>
                  {savedFilters.map(({id, name, shortcut, editMode, starred}) => 
                    <div key={id} className={'flex flex-row'}>
                      <div id={id} onClick={onFilterApply} onMouseEnter={onFilterFocus} onMouseLeave={onFilterBlur} className={`${defaultFilterId === id ? 'border-blue-700 border-r-4' : ''} flex w-full justify-between hover:opacity-50 cursor-pointer px-6 py-2`}>
                        <span id={id} className={'text-gray-400 cursor-pointer active:opacity-80'}>{name}</span>

                        <Nullable on={editMode}>
                          <Button.Xs id={id} onClick={onModeEdit} className={'bg-slate-400 px-4 py-0'}>edit filter</Button.Xs>
                        </Nullable>

                        <Nullable on={!editMode}>
                          <div className='flex flex-row items-center'>
                            <Nullable on={starred}>
                              <StarIcon id={id} className={'h-5 w-5 cursor-pointer text-gray-400'} />
                              <span className='text-gray-300 ml-2'>{shortcut}</span>
                            </Nullable>
                          </div>
                        </Nullable>
                      </div>     
                    </div>
                  )}
                </Nullable>

                <div className='flex items-center justify-center '>
                  <Button.NoBg onClick={onModeCreate} className=' text-gray-500 shadow-none hover:text-gray-900 hover:bg-gray-50 px-6 my-3'>
                    <svg className='mr-2' width='15' height='16' viewBox='0 0 15 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                      <path d='M7.07057 15.0703V0.928943' stroke='#D7DEE6' strokeWidth='3'/>
                      <path d='M-0.000134685 8.00038L14.1412 8.00038' stroke='#D7DEE6' strokeWidth='3'/>
                    </svg>
                    Add filter
                  </Button.NoBg>
                </div>
              </div>
            }

            {(mode === Mode.Create || mode === Mode.Edit) &&
              <div className='flex flex-col p-6'>
                <div className='flex space-x-6'>
                  <InputGroup label={'Title'} onChange={handleUserInput} defaultValue={formState.title ?? null} name='title' inputClassName={'pr-0'} />
                  <InputGroup Addon={null} label={'Shortcut'} onChange={handleUserInput} defaultValue={formState.shortcut ?? null} name='shortcut' inputClassName={'pr-0'} className={'w-24'} maxLength={SHORTCUT_MAXLENGTH} />
                </div>

                <div className='flex flex-col space-y-2 mt-3'>
                  <CheckBox label={'Save to menu'} onChange={handleUserInput} name='starred' isChecked={formState.starred} />
                  <CheckBox label={'Make as default'} onChange={handleUserInput} name='isDefault' isChecked={formState.isDefault} />
                </div>

                <div className='flex space-x-2 mt-5'>
                  <Nullable on={mode === Mode.Edit}><Button.NoBg onClick={deleteFilter} className={'shadow-none text-gray-400 font-normal py-0'}>Delete</Button.NoBg></Nullable>
                  <div className='flex-grow'></div>

                  <Button.NoBg onClick={onModeCancel} className={'shadow-none text-gray-400 font-normal px-2 py-0'}>Cancel</Button.NoBg>
                  <Button.Xs onClick={onFilterSave} className={'bg-oxford text-white px-4 py-0 hover:bg-gray-700'}>Save</Button.Xs>
                </div>
              </div>
            }
          </div>

          <div className='flex-grow flex flex-col border-l-2 border-slate-200 py-6 px-6'>
            <div className='grid grid-cols-4 gap-x-6 gap-y-5 mb-6'>
              {filtersData.map(({key, label, filter, Component, Child, values, displayValue}, index) => {
                // select or multiselect
                if (filter === 'select' || filter === 'multiselect') {
                  let currentValue = '';
                    
                  if (key in state && filter === 'select') {
                    currentValue = state[key];
                  } else if (key in state && filter === 'multiselect') {
                    currentValue = state[key].map(f => f).join(', ');
                  }

                  return <SelectBox
                    className={'w-full'}
                    key={key} 
                    label={label}
                    twLabel={'text-sm'} 
                    onChange={v => dispatch({type: filter.toUpperCase(), value: v, key: key})}
                    multiple={filter === 'multiselect' ? true : false}  
                    value={currentValue} 
                    placeholder={filter === 'multiselect' ? 'Select [Multiple choices]' : 'Any [Select]'}
                  >
                    {map(
                      value => (
                        <SelectBox.Option key={value?.value ?? value} value={value?.value ?? value}>
                          {value?.name ?? value}
                        </SelectBox.Option>
                      ),
                      values ?? []
                    )}
                  </SelectBox>
                }
                
                // autocomplete or combobox
                if (filter === 'autocomplete') {
                  let currentValue = '';
                  
                  if (key in state && isArray(state[key])) {
                    currentValue = state[key].map(f => f).join(', ');
                  } 

                  return <ComboBox 
                    key={key}
                    labelText={label}
                    placeholder={'Search [Multiple choices]'}
                    className={'w-full'}
                    value={currentValue}
                    onChange={v => dispatch({type: filter.toUpperCase(), value: v, key: key})}
                    multiple={true}
                    displayValue={displayValue}
                  >
                    {map(
                      value => (
                        <ComboBox.Option key={value?.value ?? value} value={value?.value ?? value}>
                          {value?.name ?? displayValue(value)}
                        </ComboBox.Option>
                      ),
                      values ?? []
                    )}
                  </ComboBox>
                }

                // date
                else if (filter === 'date') {
                  return <DatePicker 
                    className={'w-full max-h-8'}
                    key={key} 
                    label={label} 
                    defaultValue={state[`${key}_start`] ? new Date(state[`${key}_start`]) : null}
                    placeholder={'Select date...'} 
                    onChange={v => dispatch({type: filter.toUpperCase(), value: v, key: key})} 
                  />
                }

                // date range
                else if (filter === 'daterange') {
                  return <DatePicker 
                    className={'w-full max-h-8'}
                    key={key} 
                    label={label} 
                    defaultValue={state[`${key}`]}
                    placeholder={'Select period...'} 
                    onChange={v => dispatch({type: filter.toUpperCase(), value: v, key: key})} 
                    range={true}
                  />
                }

                // number range
                else if (filter === 'range') {
                  return <div className='w-full' key={key}>
                    <div className='flex flex-col' >
                      <span className='text-sm mt-1'>{label}</span>
                      <div className='flex flex-row space-x-2 mt-1'>
                        <InputGroup
                          className={'w-full'}
                          inputClassName={'max-h-8'}
                          key={`${key}_start`} 
                          value={state[`${key}_start`] ?? ''}
                          placeholder={'From...'}
                          onChange={onInputEventOrEmpty(v => dispatch({type: filter.toUpperCase(), value: v, key: `${key}_start`}))} />
                        
                        <InputGroup
                          className={'w-full'}
                          inputClassName={'max-h-8'}
                          key={`${key}_end`} 
                          value={state[`${key}_end`] ?? ''}
                          placeholder={'To...'}
                          onChange={onInputEventOrEmpty(v => dispatch({type: filter.toUpperCase(), value: v, key: `${key}_end`}))} />
                      </div>
                    </div>
                  </div>
                }

                // rest (text)
                return <InputGroup
                  className={'w-full'}
                  inputClassName={'max-h-8'}
                  twLabel={'text-sm'}
                  key={key} 
                  label={label}
                  value={state[key] ? state[key].replace(/%/g, '') : ''}
                  placeholder={'Search...'}
                  onChange={onInputEventOrEmpty(v => dispatch({type: filter.toUpperCase(), value: v, key: key}))} />
              })}
            </div>
            
            {/* filtering columns */}
            <div >
              <span className='text-sm'>Column order</span>
              <Filter onValues={setColumns}>{pickedColumns}</Filter>
            </div>

            {/*  */}
            <div className='mt-4 flex'>
              <Nullable on={defaultFilterId}>
                <Button.NoBg id={defaultFilterId} className={'bg-gray-200 px-6 py-0 hover:bg-gray-500 text-white'} onClick={onSaveFilterShortcut}>{t('save_filter')}</Button.NoBg>
              </Nullable>
              <div className='flex flex-1 justify-end gap-8 align-center'>
                <Nullable on={hideArchived && filterOptions?.canArchive}>
                  <Button.NoBg className='text-gray-300' onClick={() => setHideArchived(false)}>{t('show_archived')}</Button.NoBg>
                </Nullable>

                <Nullable on={!hideArchived && filterOptions?.canArchive}>
                  <Button.NoBg className='text-gray-300' onClick={() => setHideArchived(true)}>{t('hide_archived')}</Button.NoBg>
                </Nullable>

                <Button.NoBg onClick={handleExport} className='flex align-center text-gray-500 focus:ring-0 shadow-none hover:text-gray-900 hover:bg-gray-50'>
                  <DocumentDownloadIcon className='w-6 h-6 text-gray-300 cursor-pointer inline-block focus:ring-0' /> 
                  {t('export')}
                </Button.NoBg>
                <Button.Sm id='search_Ieškoti' className={'bg-oxford px-6 py-0 hover:bg-gray-700'} onClick={search}>{t('search')}</Button.Sm>
              </div>
            </div>
          </div>
          <div className='w-1/5 md:none'></div>
        </div>
      </div>
    )}, 
    [state, savedFilters, mode, formState, showFilter, pickedColumns, hideArchived]
  );
  
  // query params to be sent to GraphQl
  const queryParams = useMemo(() => {
    if (isFunction(customFilter)) return customFilter(state, filtersData);
    const params = {};
    
    for (const [key, value] of Object.entries(state)) {
      const filter = filtersData.find(f => f.key === key.replace('_start', '').replace('_end', ''));
      if (!filter) continue;
      
      if (value === undefined || value === null || value === '') continue;

      // custom filtering
      if (filter.custom !== undefined && isFunction(filter.custom)) {
        params[key] = filter.custom(value, state);
        continue;
      }

      if (key.includes('_end')) continue;

      // range filters: range, datepicker (single)
      
      if (key.includes('_start')) {
        const column = key.replace('_start', '');
        
        if (`${column}_end` in state) {
          params[column] = {
            _gte: value, 
            _lte: state[`${column}_end`]
          };
        }
      } 
      
      // single filters
      else {
        // array filter / multiselect
        if (isArray(value)) {
          // filter in relationship
          if (filter.key.includes('.')) {
            const columns = filter.key.split('.');            
            params[columns[0]] = unflatten({[filter.key.replace(`${columns[0]}.`, '')]: {_in: value.map(v => v)}});
            continue;
          }

          // default
          params[key] = {_in: value.map(v => v)};
        }

        // single select
        else if (filter.filter === 'select') {
          if (value.toUpperCase() === 'ANY') continue; // special case
          params[key] = {_eq: value};
        }

        // has . -> has inner column key
        else if (filter.key.includes('.')) {
          const columns = filter.key.split('.');
          for (c of columns) {
          }
        }

        // range filter
        else if (filter.filter === 'range' || filter.filter === 'daterange') {
          if (key.includes('_start')) {
            const column = key.replace('_start', '');
            
            if (`${column}_end` in state) {
              params[column] = {
                _gte: value, 
                _lte: state[`${column}_end`]
              };
            }
          } 
        }

        // text filter
        else if (filter.filter === 'text') {
          params[key] = {_ilike: value};
        }

        // single value
        else {
          params[key] = {_eq: value};
        }
      }
    }



    return {
      where: {
        _and: !filterOptions?.canArchive ? {...params} : hideArchived ? {...params, archived_at: {_is_null: true}} : {...params, archived_at: {_is_null: false}},        
      },
      orderBy: {[sortColumnKey?.replace('-', '')]: sortColumnKey && sortColumnKey[0] === '-' ? DIRECTION_DESC : DIRECTION_ASC}
    };
  }, [state, sortColumnKey, filterOptions, hideArchived]);


  return [
    queryParams,
    filters,
    columns,
    getFilter(defaultFilterId),
    toggleFilter,
    setExportData,
    sortColumnKey,
    setSortColumn,
  ]
}

