import React, { Suspense, useEffect } from 'react'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import Api from '../../api/Api'
import { useNavigate, useParams } from 'react-router-dom'
function Bike() {
  const location = useLocation()
  const { id } = useParams()
  const navigate = useNavigate()
  const type = location?.state
  const [bike, setBike] = useState({})
  const [user, setUser] = useState({})

  const getUserData = async () => {
    let userId =
      type === 'info'
        ? localStorage.getItem('userProfileId')
        : localStorage.getItem('userId')
    const responseUser = await Api.call({}, `users/${userId}`, 'get', userId)
    if (responseUser.data) {
      let userData = responseUser.data.data
      let selectedBike = id ? userData.bikes.find((a) => a.id == id) : {}
      setUser(userData)
      setBike(selectedBike)
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  const handleChange = (value, field) => {
    setBike({ ...bike, [field]: value })
  }

  const updateBike = async () => {
    let path = id ? `bikes/${id}` : `bikes`
    const response = await Api.call(
      bike,
      path,
      'put',
      localStorage.getItem('userId')
    )
    if (response.data) {
      if (type === 'info') {
        navigate('/setting/user-info')
        window.location.reload(false)
      } else {
        window.location.reload(false)
      }
    }
  }

  return (
    <div className='edit-card'>
      <div className='card'>
        <div className='card-header p-3'>
          <h4>バイクデータ</h4>
        </div>
        <form className='p-4'>
          <div class='mb-3 row'>
            <label for='name' class='col-sm-4 col-form-label'>
              バイク名
            </label>
            <div class='col-sm-8'>
              <input
                class='form-control'
                id='name'
                value={bike?.name}
                onChange={(event) => handleChange(event.target.value, 'name')}
              />
            </div>
          </div>
          <div class='mb-3 row'>
            <label for='type' class='col-sm-4 col-form-label'>
              バイク車種
            </label>
            <div class='col-sm-8'>
              <select
                class='form-select'
                aria-label='Default select example'
                id='type'
              >
                <option selected value='1'>
                  GSX-R1100
                </option>
                <option value='2'> 車種未登録 </option>
              </select>
            </div>
          </div>
          <div class='mb-3 row'>
            <label for='sortNo' class='col-sm-4 col-form-label'>
              ソートNo
            </label>
            <div class='col-sm-8'>
              <input
                class='form-control'
                id='sortNo'
                type={'number'}
                value={bike?.sortNo}
                onChange={(event) => handleChange(event.target.value, 'sortNo')}
              />
            </div>
          </div>
          <div class='mb-3 row'>
            <label for='role' class='col-sm-4 col-form-label'>
              停止フラグ
            </label>
            <div class='col-sm-8'>
              <select
                class='form-select'
                aria-label='Default select example'
                id='role'
                disabled
              >
                <option selected value='0'>
                  有効
                </option>
              </select>
            </div>
          </div>

          <div className='d-flex justify-content-between'>
            <button
              type='button'
              className='btn btn-outline-primary btn-sm px-3'
              onClick={() => navigate(`${type === 'info'? '/setting/user-info': '/setting'}`)}
            >
              戻る
            </button>
            <div className='d-flex justify-content-between'>
              {id && (
                <button type='button' class='btn btn-danger btn-sm mx-3 px-2'>
                  削除
                </button>
              )}

              <button
                type='button'
                class='btn btn-primary'
                data-bs-toggle='modal'
                data-bs-target='#exampleModal'
              >
                更新
              </button>
            </div>
          </div>
        </form>
      </div>
      <div
        class='modal fade'
        id='exampleModal'
        tabindex='-1'
        aria-labelledby='exampleModalLabel'
        aria-hidden='true'
      >
        <div class='modal-dialog'>
          <div class='modal-content'>
            <div class='modal-header'>
              <h1 class='modal-title fs-5' id='exampleModalLabel'>
                Modal Title
              </h1>
              <button
                type='button'
                class='btn-close'
                data-bs-dismiss='modal'
                aria-label='Close'
              ></button>
            </div>
            <div class='modal-body'>
              <p>更新を実施します</p>
            </div>
            <div class='modal-footer'>
              <button
                type='button'
                className='btn btn-outline-primary'
                data-bs-dismiss='modal'
              >
                戻る
              </button>
              <button
                type='button'
                className='btn btn-primary'
                onClick={() => updateBike()}
              >
                更新
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Bike