/* eslint-disable react-perf/jsx-no-new-function-as-prop */
import React, { useCallback, useContext } from "react";
import useLanguage from "../../hook/useLanguage";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import GlobalContext from "../../context/globalContext";
import { generate } from "shortid";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export const FiltersListCrew = ({
  get,
  object,
  name,
  crew,
  intime,
  reactiontime,
  timeinobject,
  status,
  reason,
  ...props
}) => {
  const {english, lithuanian, t} = useLanguage();
  const {filterListCrew, setFilterListCrew} = useContext(GlobalContext);
  const {selectedFilterCrew, setSelectedFilterCrew} = useContext(GlobalContext);

  return (
    <div
      {...props}
    >
      {filterListCrew.map((filter) => {
        return (
          <div className={selectedFilterCrew ? "rounded-md w-full border sm:pb-2 p-2 mt-2 grid grid-cols-1 bg-white sm:grid-cols-6 justify-between font-normal text-black gap-2 z-1" : "hidden"} key={generate()}>
            {selectedFilterCrew === filter.id ? (
              <>
                {filter.crewList.map((element) => {
                  return (
                    <div
                      className={filter.id ? "visible" : "hidden"}
                      key={generate()}
                    >
                      <div className="flex p-1 rounded-sm text-xs font-normal justify-between items-center text-gray-400 bg-gray-200">
                        <p className="truncate">{element}</p>
                        <button
                          onClick={() => {
                            setFilterListCrew((currentFilter) =>
                              currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.filter((y) => y !== element)} : x))}
                          }
                        >
                          <img
                            className="h-2 w-2"
                            src={require("../../assets/assets/x.png")}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            ) : null}
            {/* </> */}
          </div>
        );
      })}

      <Menu as="div" className="relative inline-block text-left">
        <div className="flex flex-col  w-full">
          <Menu.Button className="flex p-1 text-xs font-normal justify-center  items-center text-gray-400 bg-white hover:text-gray-500">
            <img
              className="h-4 w-4 mr-4"
              src={require("../../assets/assets/plus.png")}
            />
            <p className="truncate">Pridėti stulpelį</p>
          </Menu.Button>
        </div>

        {filterListCrew.map((filter, index) => {
          return (
            <div key={filter.id}>
              {selectedFilterCrew === filter.id ? (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="origin-top-right z-10 absolute left-0 mt-2 w-56 shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      {filter.crewList.includes("Pavadinimas") ? null : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const showDate = "Pavadinimas";
                                setFilterListCrew((currentFilter) =>
                                  currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.concat(showDate)} : x))}}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900 w-full text-center"
                                  : "text-center w-full text-gray-400",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Pavadinimas
                            </button>
                          )}
                        </Menu.Item>
                      )}

                      {filter.crewList.includes("Trumpinys") ? null : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const object = "Trumpinys";
                                setFilterListCrew((currentFilter) =>
                                  currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.concat(object)} : x))}}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900 w-full text-center"
                                  : "text-center w-full text-gray-400",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Trumpinys
                            </button>
                          )}
                        </Menu.Item>
                      )}

                      {filter.crewList.includes("Dislokacijos zona") ? null : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const object = "Dislokacijos zona";
                                setFilterListCrew((currentFilter) =>
                                  currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.concat(object)} : x))}}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900 w-full text-center"
                                  : "text-center w-full text-gray-400",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Dislokacijos zona
                            </button>
                          )}
                        </Menu.Item>
                      )}

                      {filter.crewList.includes("Būsena") ? null : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const object = "Būsena";
                                setFilterListCrew((currentFilter) =>
                                  currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.concat(object)} : x))}}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900 w-full text-center"
                                  : "text-center w-full text-gray-400",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Būsena
                            </button>
                          )}
                        </Menu.Item>
                      )}

                      {filter.crewList.includes("Automatiškai priskirti") ? null : (
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => {
                                const object = "Automatiškai priskirti";
                                setFilterListCrew((currentFilter) =>
                                  currentFilter.map((x) => x.id === filter.id ? {...x, crewList: x.crewList.concat(object)} : x))}}
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900 w-full text-center"
                                  : "text-center w-full text-gray-400",
                                "block w-full text-left px-4 py-2 text-sm"
                              )}
                            >
                              Automatiškai priskirti
                            </button>
                          )}
                        </Menu.Item>
                      )}
                    </div>
                  </Menu.Items>
                </Transition>
              ) : null}
            </div>
          );
        })}
      </Menu>
    </div>
  );
};

{
  /* replace to drag and drop if needed*/
}