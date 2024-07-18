import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Api from '../../api/Api';

function MonitoringModal({ device, updateRange, range }) {
  const initialDevice = {
    turnOn: device.monitoringActive,
    imsi: device?.device.imsi,
    range: device?.monitoringSettings?.range,
    nbrOfNotifications: device?.monitoringSettings?.nbrOfNotifications,
  };
  const [monitoringFields, setMonitoringFields] = useState(initialDevice);
  const [show, setShow] = useState(true);
  const geofences = [
    {
      id: 50,
      name: '50m',
    },
    {
      id: 70,
      name: '70m',
    },
    {
      id: 100,
      name: '100m',
    },
  ];
  const notifications = [
    {
      id: 5,
      name: '5',
    },
    {
      id: 7,
      name: '7',
    },
    {
      id: 10,
      name: '10',
    },
  ];

  const handleConfirm = async () => {
    const body = device?.monitoringActive
      ? { turnOn: false, imsi: monitoringFields.imsi }
      : { ...monitoringFields, turnOn: true };
    const response = await Api.call(
      body,
      `devices/monitoringSettings`,
      'put',
      ''
    );
    if (response.data.code === 200) {
      const returnedDevice = response.data?.data;
      const updatedRange = returnedDevice.monitoringActive
        ? returnedDevice.monitoringSettings.range
        : 0;
      close(returnedDevice);
    }
  };

  const handleSelect = (field, event) => {
    const value = parseInt(event.target.value);
    setMonitoringFields({ ...monitoringFields, [field]: value });
  };

  const close = (device) => {
    setShow(false);
    updateRange(device);
  };

  return (
    <Modal show={show} onHide={close} className={'monitoring-modal'}>
      <Modal.Header closeButton>
        <Modal.Title className={'fs-5'}>{`${
          device?.monitoringActive
            ? '監視モードを停止しますか'
            : '監視モードを開始しますか'
        }`}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {device?.monitoringActive ? (
          <p className="fs-6">監視モードを停止しますか</p>
        ) : (
          <form>
            <div class="row">
              <div class="col-md-12 col-sm-12">
                <div class="form-group mb-2">
                  <label className="my-2 fs-6">ジオフェンスサイズ</label>
                  <select
                    class="form-control form-select selectpicker"
                    name="geofence"
                    onChange={(event) => handleSelect('range', event)}
                  >
                    {geofences.map((geofence) => {
                      return (
                        <option
                          value={monitoringFields.range}
                          selected={geofence.id === monitoringFields.range}
                        >
                          {geofence.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12 col-sm-12">
                <div class="form-group mb-2">
                  <label className="my-2 fs-6">
                    通知制限
                    <br />
                    (自動的に移動通知検知を停止しますが位置は記録しています)
                  </label>
                  <select
                    class="form-control form-select selectpicker"
                    name="notifications"
                    onChange={(event) =>
                      handleSelect('nbrOfNotifications', event)
                    }
                  >
                    {notifications.map((notification) => {
                      return (
                        <option
                          value={monitoringFields.nbrOfNotifications}
                          selected={
                            notification.id ===
                            monitoringFields.nbrOfNotifications
                          }
                        >
                          {notification.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-primary" onClick={() => close()}>
          閉じる
        </Button>
        <Button
          className="btn btn-danger btn-sm"
          onClick={() => handleConfirm()}
        >
          {device?.monitoringActive ? '停止' : '開始'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default MonitoringModal;
