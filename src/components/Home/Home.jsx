import { Dropdown } from 'bootstrap';
import React, { Suspense, useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './Home.css';
import {
  APIProvider,
  //   Map,
  //   Marker,
  //   useMap,
  //   useMapsLibrary,
} from '@vis.gl/react-google-maps';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Api from '../../api/Api';
import CutomMap from './Map';
import MonitoringModal from './MonitoringModal';
import Utils from '../utils/utils';
import EngineModal from './EngineModal';

const API_KEY = import.meta.env.API_KEY;
function Home(props) {
  // const initialValue = useMemo(() => {
  //   console.log('props: ', props);
  //   const localStorageValueStr = localStorage.getItem('filter');
  //   // If there is a value stored in localStorage, use that
  //   if (localStorageValueStr) {
  //     return JSON.parse(localStorageValueStr);
  //   }
  //   // Otherwise use initial_value that was passed to the function
  //   return initialValue;
  // }, []);
  const navigate = useNavigate();
  const { setLayoutKey } = props;
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState({});
  const [selectedBike, setSelectedBike] = useState({});
  const [selectedDevice, setSelecteDevice] = useState({});
  const [device, setDevice] = useState({});
  const [movements, setMovements] = useState([]);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showMonitoring, setShowMonitoring] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);
  const [range, setRange] = useState(0);
  const [updatedKey, setUpdatedKey] = useState(Utils.unique());
  const [pageKay, setPageKay] = useState(Utils.unique());
  const [firstCall, setFirstCall] = useState(true);
  const [engine, setEngine] = useState({});
  // const [filter, setFilter] = usePersistState(initialValue);

  const lineApi = async () => {
    setLoading(true);
    const body = {
      code: searchParams.get('code'),
      redirectUri: location.origin,
    };
    const response = await Api.call(
      body,
      `auth/line`,
      'post',
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      const userId = response.data.data.accessToken;
      const userName = response.data.data?.profile?.name1;
      localStorage.setItem('userId', userId);
      if (userName) localStorage.setItem('user-name', userName);
      setLayoutKey(Utils.unique());
      navigate('/');
    }
  };

  const formatDate = (date) => {
    let updatedDate = new Date(date),
      month = '' + (updatedDate.getMonth() + 1),
      day = '' + updatedDate.getDate(),
      year = updatedDate.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  };

  const getDeviceInfo = async (device = selectedDevice, field = '') => {
    const deviceInfo = await Api.call(
      {},
      `devices/latestInfo?imsi=${device.imsi}`,
      'get',
      localStorage.getItem('userId')
    );
    if (deviceInfo.data.code === 200) {
      const movementResponse = await Api.call(
        {},
        `devices/movements?imsi=${device.imsi}&fromDate=${formatDate(
          startDate
        )}&toDate=${formatDate(endDate)}`,
        'get',
        localStorage.getItem('userId')
      );
      setDevice(deviceInfo.data.data);
      setRange(
        deviceInfo.data.data?.monitoringActive
          ? deviceInfo.data.data?.monitoringSettings?.rannge
          : 0
      );
      setMovements(movementResponse.data.data);
      if (field && field !== 'user') setLoading(false);
    }
  };

  const getHomePage = async () => {
    const response = await Api.call(
      {},
      `homePage`,
      'get',
      localStorage.getItem('userId')
    );
    if (response.data.code === 200) {
      const users = response.data.data;
      if (users.length > 0) {
        setUsers(users);
        let user;
        if (isEmpty(selectedUser)) {
          user = users[0];
        } else {
          user = selectedUser;
        }

        const bike = isEmpty(selectedBike) ? user.bikes[0] : selectedBike;
        const device = isEmpty(selectedDevice)
          ? bike.devices[0]
          : selectedDevice;
        setSelectedUser(user);
        setSelectedBike(bike);
        setSelecteDevice(device);
        getDeviceInfo(device);
        setUpdatedKey(Utils.unique());
        localStorage.removeItem('type');
        // setFilter(user);
      } else {
        navigate('/setup');
        localStorage.setItem('type', 'not-registered');
      }
      setFirstCall(false);
    }
  };

  const loadFunc = () => {
    if (window.tTo) {
      clearTimeout(window.tTo);
    }
    window.tTo = setTimeout(() => getHomePage(), firstCall ? 0 : 30000);
  };

  const getIbcDevices = async (selectedUser = {}) => {
    setLoading(true);
    const userId = Utils.isEmptyObject(selectedUser)
      ? localStorage.getItem('userId')
      : selectedUser?.id;
    const ibcDevices = await Api.call({}, `ibcDevices`, 'get', userId);
    if (ibcDevices.data.code === 200) {
      setLoading(false);
      if (ibcDevices.data.data.length > 0) setEngine(ibcDevices.data.data[0]);
      else setEngine({});
    }
  };

  useEffect(() => {
    if (searchParams.size > 0) {
      lineApi();
    } else {
      if (!localStorage.getItem('userId')) {
        navigate('/login');
      } else {
        loadFunc();
        if (firstCall) getIbcDevices();
      }
    }
  }, [users]);

  const handleSelect = (field, event) => {
    const value = event.target.value;
    let userToUpdate, bikeToUpdate, devicetoUpdate;
    switch (field) {
      case 'user':
        userToUpdate = users.find((a) => a.id.toString() === value);
        bikeToUpdate = userToUpdate.bikes[0];
        devicetoUpdate = bikeToUpdate.devices[0];
        setSelectedUser(userToUpdate);
        setSelectedBike(bikeToUpdate);
        setSelecteDevice(devicetoUpdate);
        break;
      case 'bike':
        bikeToUpdate = selectedUser.bikes.find(
          (a) => a.id.toString() === value
        );
        devicetoUpdate = bikeToUpdate.devices[0];
        setSelectedBike(bikeToUpdate);
        setSelecteDevice(devicetoUpdate);
        break;
      case 'device':
        devicetoUpdate = selectedBike.devices.find(
          (a) => a.id.toString() === value
        );
        setSelecteDevice(devicetoUpdate);
        break;
    }
    setLoading(true);
    getDeviceInfo(devicetoUpdate, field);
    setShow(false);
    if (field === 'user') getIbcDevices(userToUpdate);
  };

  const isEmpty = (value) => {
    return Object.keys(value).length === 0 && value.constructor === Object;
  };

  const handleClick = () => {
    setLoading(true);
    getDeviceInfo();
    setShow(false);
  };

  const showModal = (event) => {
    event.preventDefault();
    setShowMonitoring(true);
  };

  const showEngModal = (event) => {
    event.preventDefault();
    setShowEngineModal(true);
  };

  const updateRange = (updatedDevice) => {
    if (updatedDevice) {
      setDevice(updatedDevice);
      setUpdatedKey(Utils.unique());
      setShow(false);
    }
    setShowMonitoring(false);
  };

  const updateEngine = (updatedEngine) => {
    if (updatedEngine) {
      setEngine(updatedEngine);
      setUpdatedKey(Utils.unique());
      setShow(false);
    }
    setShowEngineModal(false);
  };

  const renderSearchBar = () => {
    return (
      <div className={`col col-md-3 results-wrapper`}>
        <div class="row">
          <div class="form search-form inputs-underline">
            <form>
              <div class="section-title">
                <h3>Select</h3>
              </div>
              <div class="row">
                <div class="col-md-6 col-sm-6">
                  <DatePicker
                    dateFormat={'yyyy-MM-dd'}
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    showMonthDropdown
                    showYearDropdown
                  />
                </div>
                <div class="col-md-6 col-sm-6">
                  <div class="form-group">
                    <DatePicker
                      dateFormat={'yyyy-MM-dd'}
                      selected={endDate}
                      onChange={(date) => setEndDate(date)}
                      showMonthDropdown
                      showYearDropdown
                    />
                  </div>
                </div>
              </div>

              <div class="form-group">
                <button
                  type="submit"
                  data-ajax-response="map"
                  data-ajax-data-file="assets/external/data_2.php"
                  data-ajax-auto-zoom="1"
                  class="btn btn-primary pull-right search-btn"
                  onClick={() => handleClick()}
                >
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>

        <div class="row">
          {/* <div class="results-wrapper"> */}
          <div class="form search-form inputs-underline">
            <form>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class="form-control form-select selectpicker"
                      name="city"
                      onChange={(event) => handleSelect('user', event)}
                    >
                      {!isEmpty(selectedUser) &&
                        users.map((user) => {
                          return (
                            <option
                              value={user.id}
                              selected={user.id === selectedUser.id}
                            >
                              {user.nickname}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class={`form-control ${
                        !isEmpty(selectedUser)
                          ? selectedUser?.bikes.length > 1
                            ? 'form-select'
                            : ''
                          : 'form-select'
                      } selectpicker`}
                      name="category"
                      onChange={(event) => handleSelect('bike', event)}
                    >
                      {!isEmpty(selectedUser) &&
                        selectedUser?.bikes.map((bike) => {
                          return (
                            <option
                              value={bike.id}
                              selected={bike.id === selectedBike.id}
                            >
                              {bike.name}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>
              </div>
              <div class="row">
                <div class="col-md-12 col-sm-12">
                  <div class="form-group">
                    <select
                      class={`form-control ${
                        !isEmpty(selectedBike)
                          ? selectedBike?.devices.length > 1
                            ? 'form-select'
                            : ''
                          : 'form-select'
                      } selectpicker`}
                      name="device"
                      onChange={(event) => handleSelect('device', event)}
                    >
                      {!isEmpty(selectedBike) &&
                        selectedBike?.devices.map((device) => {
                          return (
                            <option
                              value={device.id}
                              selected={device.id === selectedDevice.id}
                            >
                              {device.name}
                            </option>
                          );
                        })}
                    </select>
                  </div>
                </div>
              </div>
            </form>
          </div>
          {/* </div> */}
        </div>
        <div class="row">
          {/* <div class="results-wrapper"> */}
          <div class="form search-form inputs-underline">
            <form>
              <div class="section-title">
                <h3></h3>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">監視モード：</div>
                <div class="col-md-6 col-sm-6">
                  <button
                    style={{ width: '100%' }}
                    onClick={(event) => showModal(event)}
                    class={`btn ${
                      device?.monitoringActive
                        ? 'btn-outline-primary'
                        : 'btn-primary'
                    }`}
                  >
                    {device?.monitoringActive ? '監視中' : '解除中'}
                  </button>
                </div>
              </div>
              <hr />
              {!Utils.isEmptyObject(engine) && (
                <div class="row">
                  <div class="col-md-6 col-sm-6">{'エンジン制御：'}</div>
                  <div class="col-md-6 col-sm-6">
                    <button
                      style={{ width: '100%' }}
                      onClick={(event) => showEngModal(event)}
                      class={`btn ${
                        engine?.engineStatus === 'OFF'
                          ? 'btn-outline-primary'
                          : 'btn-primary'
                      }`}
                    >
                      {engine?.engineStatus}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
          {/* </div> */}
        </div>
        <div class="row">
          {/* <div class="results-wrapper"> */}
          <div class="form search-form inputs-underline">
            <form>
              <div class="section-title">
                <h3>最終通信情報</h3>
              </div>
              <hr />

              <div class="row">
                <div class="col-md-6 col-sm-6">端末状態：</div>
                <div class="col-md-6 col-sm-6">
                  <p
                    style={{ width: '100%' }}
                    class={`btn ${
                      device?.deviceStatus === '要確認'
                        ? 'btn-outline-danger'
                        : 'btn-outline-primary'
                    }`}
                  >
                    {device?.deviceStatus}
                  </p>
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">通信日時</div>
                <div class="col-md-6 col-sm-6">
                  {device?.lastLocation?.dt?.replace('T', ' ')}
                </div>
              </div>
              <hr />
              <div class="row">
                <div class="col-md-6 col-sm-6">バッテリー：</div>
                <div class="col-md-6 col-sm-6">
                  <span>{device?.lastLocation?.bat}</span>
                </div>
              </div>
              <hr />
              {/* <div class="row">
                <div class="col-md-6 col-sm-6">監視モード：</div>
                <div class="col-md-6 col-sm-6">
                  <button
                    style={{ width: '100%' }}
                    onClick={(event) => showModal(event)}
                    class={`btn ${
                      device?.monitoringActive
                        ? 'btn-outline-primary'
                        : 'btn-primary'
                    }`}
                  >
                    {device?.monitoringActive ? '監視中' : '解除中'}
                  </button>
                </div>
              </div> */}
            </form>
          </div>
          {/* </div> */}
        </div>
      </div>
    );
  };

  const showBar = () => {
    setShow(!show);
  };

  return (
    <div id="page-content" key={pageKay}>
      {!loading && (
        <div class="hero-section full-screen has-map has-sidebar">
          <div class="row">
            <div className="search-responsive" onClick={() => showBar()}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                fill="white"
                class="bi bi-arrow-bar-right"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 8a.5.5 0 0 0 .5.5h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L12.293 7.5H6.5A.5.5 0 0 0 6 8m-2.5 7a.5.5 0 0 1-.5-.5v-13a.5.5 0 0 1 1 0v13a.5.5 0 0 1-.5.5"
                />
              </svg>
            </div>

            <div className={`show-side-bar ${show ? 'show' : 'hide'}`}>
              {renderSearchBar()}
            </div>

            <APIProvider apiKey={API_KEY}>
              <CutomMap
                device={device}
                movements={movements}
                key={updatedKey}
                range={range}
                showModal={showModal}
              />
            </APIProvider>
            {renderSearchBar()}
          </div>
          {showMonitoring && (
            <MonitoringModal
              device={device}
              updateRange={updateRange}
              range={range}
            />
          )}
          {showEngineModal && (
            <EngineModal engine={engine} updateEngine={updateEngine} />
          )}
        </div>
      )}
    </div>
  );
}

export default Home;
