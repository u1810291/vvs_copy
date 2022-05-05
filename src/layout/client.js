import React, { useState, useContext, useCallback, useEffect } from "react";
import useLanguage from "../hook/useLanguage";
import SidebarBack from "../components/sidebars/back";
import { CreateHeader } from "../components/headers/create";
import { Object } from "../components/lists/object";
import { clientList } from "../api/client";
import { generate } from "shortid";
import GlobalContext from "../context/globalContext";
import AuthContext from "../context/authContext";

function Client() {
  const { english, lithuanian, t } = useLanguage();
  const [clientName, setClientName] = useState("");
  const [clientSurname, setClientSurname] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientLastLogin, setClientLastLogin] = useState("");
  const { sent, setSent, user, ForgotPasswordFromAdmin } = useContext(AuthContext);

  useEffect(() => { // get iat for all users
      if (user.iat) {
        const lastLogin = new Date(user.iat * 1000).toLocaleString();
        setClientLastLogin(String(lastLogin));
      }
  },[user.iat])

  const clientNameFunc = useCallback(
    async (e) => {
      setClientName(e.target.value);
    },
    [setClientName]
  );

  const clientSurnameFunc = useCallback(
    async (e) => {
      setClientSurname(e.target.value);
    },
    [setClientSurname]
  );

  const clientEmailFunc = useCallback(
    async (e) => {
      setClientEmail(e.target.value);
    },
    [setClientEmail]
  );

  const clientPhoneFunc = useCallback(
    async (e) => {
      setClientPhone(e.target.value);
    },
    [setClientPhone]
  );

  useEffect(() => {
    if (sent === "true") {
      setTimeout(() => {
        setSent(null);
      }, 5000);
    }
    if (sent === "false")
      setTimeout(() => {
        setSent(null);
      }, 5000);
  }, [sent, setSent]);

  return (
    <>
      <div className="container max-w-screen-xl">
        <div className="flex w-screen flex-row justify-center h-screen relative overflow-hidden">
          <div className="flex flex-col h-screen items-center w-full ">
            <div className="flex flex-row w-full justify-between h-screen ">
              <SidebarBack />
              <div className="flex flex-col h-screen w-full justify-between">
                <CreateHeader />
                <div className="flex flex-row h-screen">
                  <div className="flex pl-4 flex-row w-full h-full justify-between">
                    <div className="flex h-full flex-col justify-between w-full pr-4 md:pr-0 md:w-3/6 lg:w-3/6">
                      <div className="flex flex-col">
                        <div className="flex flex-row">
                          <div className="flex mr-2 flex-col  mb-4 ">
                            <div className="flex flex-row">
                              <p className="self-start text-sm text-gray-500 truncate my-2">
                                Vardas
                              </p>
                              <p className="self-start ml-1 text-red-600 text-sm truncate my-2">
                                *
                              </p>
                            </div>
                            <input
                              id="name"
                              name="name"
                              placeholder=""
                              required
                              value={clientName}
                              onChange={clientNameFunc}
                              className="flex h-8 w-52 border placeholder-gray-400 text-black focus:outline-none sm:text-sm"
                            />
                          </div>

                          <div className="flex ml-2 flex-col mb-4 ">
                            <div className="flex flex-row">
                              <p className="self-start text-sm text-gray-500 truncate my-2">
                                Pavardė
                              </p>
                              <p className="self-start ml-1 text-red-600 text-sm truncate my-2">
                                *
                              </p>
                            </div>
                            <input
                              id="surname"
                              name="search"
                              placeholder=""
                              required
                              value={clientSurname}
                              onChange={clientSurnameFunc}
                              className="flex h-8 w-52 border placeholder-gray-400 text-black focus:outline-none sm:text-sm"
                            />
                          </div>
                        </div>

                        <div className="flex flex-row w-full">
                          <div className="flex mr-2 flex-col mb-4 ">
                            <div className="flex flex-row">
                              <p className="self-start text-sm text-gray-500 truncate my-2">
                                El. Paštas
                              </p>
                              <p className="self-start ml-1 text-red-600 text-sm truncate my-2">
                                *
                              </p>
                            </div>
                            <input
                              id="connect"
                              name="search"
                              placeholder=""
                              type="email"
                              required
                              value={clientEmail}
                              onChange={clientEmailFunc}
                              className="flex h-8 w-52 border placeholder-gray-400 text-black focus:outline-none sm:text-sm"
                            />
                          </div>

                          <div className="flex ml-2 flex-col  mb-4 ">
                            <div className="flex flex-row">
                              <p className="self-start text-sm text-gray-500 truncate my-2">
                                Telefonas
                              </p>
                            </div>
                            <input
                              id="search"
                              name="phone"
                              placeholder=""
                              value={clientPhone}
                              onChange={clientPhoneFunc}
                              type="phone"
                              className="flex h-8 w-52 border focus:outline-none sm:text-sm"
                            />
                          </div>
                          <div className="flex ml-2 flex-col  mb-4 ">
                            <div className="flex flex-row mt-10">
                              <input
                                id="email-me"
                                name="email-me"
                                type="checkbox"
                                className="ml-8 h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <p className="ml-4 self-start text-xs text-gray-500 truncate my-2">
                                Siusti vakar. d. ataskaitą paštu
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col">
                        <button
                          onClick={ForgotPasswordFromAdmin}
                          className="flex p-1 w-32 rounded-sm text-xs px-2 mb-2 font-normal justify-center items-center text-gray-400 hover:text-gray-500 bg-gray-200"
                        >
                          <p>Priminti slaptažodi</p>
                        </button>
                        {sent === "true" ? (
                          <p className="self-start text-xs text-green-500 truncate my-2">
                            Slaptažodžio priminimas sekmingai išsiųstas
                          </p>
                          ) : ( sent === "true" ? (
                            <p className="self-start text-xs text-red-500 truncate my-2">
                            Prašome pakartoti vėliau
                          </p>
                          ) : (null))}
                      </div>
                      </div>
                      <div>
                        <div className="flex w-full justify-between">
                          <a className="flex rounded-sm text-normal px-2 mb-2 font-normal items-center text-black">
                            <p>Objektai</p>
                          </a>
                          <button className="flex rounded-sm text-xs px-4 mb-2 font-normal items-center text-gray-400 hover:text-gray-500 bg-gray-200">
                            <p>Pridėti objektą</p>
                          </button>
                        </div>
                        <div className="overflow-y-auto h-96 scrollbar-gone">
                          {clientList.map((data) => (
                            <Object
                              key={generate()}
                              object={data.object}
                              name={data.name}
                              address={data.address}
                              contract={data.contract}
                              remove={data.remove}
                            />
                          ))}
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="hidden sm:w-40 sm:h-10 rounded sm:flex mr-2 mt-2 mb-1 justify-center py-2 px-4 border border-transparent drop-shadow shadow text-sm font-light text-white font-montserrat hover:shadow-none bg-red-700 focus:outline-none"
                      >
                        Archyvuoti
                      </button>
                    </div>

                    <div className="flex h-full flex-col justify-between w-full pr-4 md:pr-0 md:w-1/4 lg:w-1/4 border-b border-l">
                      <div className="flex flex-col">
                        <div className="flex flex-row w-full">
                          <div className="flex flex-row w-full border-b h-12 items-center justify-between">
                            <div className="flex ml-4 flex-row w-full">
                              <p className="text-sm text-gray-400 truncate my-2">
                                Paskutinis prisijungimas
                              </p>
                            </div>

                            <div className="flex ml-4 flex-row w-full">
                              <p className="text-sm truncate my-2">
                                {clientLastLogin}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Client;
