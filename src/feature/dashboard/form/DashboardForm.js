import React, {useEffect, useMemo} from 'react';

import SidebarRight from '../components/SidebarRight';
import SidebarLeft from '../components/SidebarLeft';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Button from 'components/Button';
import {GQL as CREW_GQL} from 'feature/crew/api/useCrewsForEvent';
import {GQL as TASK_GQL} from 'feature/task/api/useTasksForEvent';
import useSubscription from 'hook/useSubscription';
import MapV2 from '../components/MapV2';
import {getFlatNodesThroughCalendar, getZoneItemsThroughCalendar} from 'feature/breach/utils';
import {groupBy} from 'util/utils';

// updated_at + duration - new Date()
const lostConnection = (time) => {
  return new Date() - new Date(time) > 60000
}

const DashboardForm = () => {
  const {t} = useTranslation('dashboard');
  const nav = useNavigate();
  const tasksQuery = useMemo(() => TASK_GQL, []);
  const crewsQuery = useMemo(() => CREW_GQL, []);
  const crews = useSubscription(crewsQuery);
  const tasks = useSubscription(tasksQuery);
  const groupedCrews = useMemo(() => groupBy(crews?.data?.crew, 'status'), [crews.data?.crew])
  const crewsZonePaths = useMemo(() => crews.data?.crew?.map((el) => getZoneItemsThroughCalendar(el)), [crews?.data?.crew]);
  const crewsZoneCoordinates = useMemo(() => crews.data?.crew?.map((el) => getFlatNodesThroughCalendar(el)), [crews?.data?.crew[0]]);
  const destinations = useMemo(() => crews?.data?.crew?.map((el) => ({id: el.id, crew: `${el.abbreviation} ${el.name}`, lat: el.latitude, lng: el.longitude})), [crews?.data?.crew]);
  const temp = useMemo(() => ({
    data: crews?.data?.crew?.map((el) => ({
      connectionLost: el.user_settings.length ? lostConnection(el.user_settings[0]?.last_ping): false,
      ...el
    })
  )}), [crews?.data?.crew]);
  
  useEffect(() => {
    console.log(crews)
  }, [crews.data?.crew]);
 
  
  return (
    <>
      <section className='flex flex-col h-screen scrollbar-gone overflow-y-auto w-1/4 bg-gray-100'>
        <div className='flex flex-row items-center border-b bg-white justify-between'>
          <h4 className='ml-2 self-center py-4 text-md font-normal'>{t`left.console`}</h4>
          <Button.Pxl onClick={() => {nav('/task/new')}}
            className='w-36 h-10 flex mr-2 justify-center items-center rounded-sm px-1 border-transparent drop-shadow shadow text-sm font-light text-white font-montserrat hover:shadow-none bg-slate-600 hover:bg-slate-500 focus:outline-none'>
            {t`left.create_task`}
          </Button.Pxl>
        </div>
        <aside className='border-l border-gray-border min-w-fit'>
          <SidebarLeft tasks={tasks} />
        </aside>
      </section>
      <section className='flex flex-col h-screen justify-between w-2/4 bg-gray-100'>
        <MapV2 crew={crews} zonePaths={crewsZonePaths} zoneCoordinates={crewsZoneCoordinates} destinations={destinations} />
      </section>
      <section className='flex flex-col h-screen justify-between overflow-y-auto w-1/4 bg-gray-100'>
        <aside className='border-l border-gray-border min-w-fit'>
          <SidebarRight crews={temp} />
        </aside>
      </section>
    </>
  );
};

export default DashboardForm;
