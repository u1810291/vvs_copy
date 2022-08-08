import SelectBox from 'components/atom/input/SelectBox';
import useResultForm, {FORM_FIELD} from 'hook/useResultForm';
import {titleCase} from '@s-e/frontend/transformer/string';
import {KeyListRoute} from '../routes';
import {useKey} from '../api';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useCrews} from 'feature/crew/api/crewEditApi';
import {
  constant,
  chain,
  getProp,
  isEmpty,
  map,
  // isTruthy,
  not,
  option,
  pipe,
  safe,
  // identity,
} from 'crocks';
import InputGroup from 'components/atom/input/InputGroup';

const displayValue = mapper => pipe(
  getProp('value'),
  chain(safe(not(isEmpty))),
  map(mapper),
  option(''),
  constant,
)



const onChange = ({set}) => ({value}) => set(value);

const KeyEditForm = ({saveRef, removeRef}) => {
  const {id} = useParams();
  const {t} = useTranslation('key', {keyPrefix: 'edit'});
  const {t: tf} = useTranslation('key', {keyPrefix: 'edit.field'});
  
  const crews = useCrews();

  const {ctrl, result, setForm} = useResultForm({
    set_name: FORM_FIELD.TEXT({label: tf`set_name`}),
    crew_id: FORM_FIELD.TEXT({label: tf`crew_id`, props: {
      displayValue: displayValue((v) => {
        const crew = crews?.data?.find(c => c.id === v);
        return titleCase(crew?.name || crew?.id);
      }),
      onChange,
    }}),
  });

  useKey({
    id,
    formResult: result,
    setForm,
    successRedirectPath: KeyListRoute.props.path,
    saveRef,
    removeRef,
  });

  return (
    <section className={'flex flex-1 flex-grow h-max'}>
      <div className={'p-6 space-y-4 lg:space-y-0 lg:flex lg:space-x-4 flex-grow'}>
        <InputGroup className={'lg:w-1/3 xl:w-1/4'} inputClassName={'h-[32px]'} {...ctrl('set_name')} />

        <SelectBox className={'lg:w-1/3 xl:w-1/4'} {...ctrl('crew_id')}>
          {map(crew => (
            <SelectBox.Option key={`${crew.id} ${+ new Date()}`} value={crew.id}>
              {titleCase(crew.name || crew.id)}
            </SelectBox.Option>
          ), (crews?.data || []))}
        </SelectBox>
      </div>
    </section>
  );
}

export default KeyEditForm;
