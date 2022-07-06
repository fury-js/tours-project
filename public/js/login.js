/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/v1/users/login',
      data: {
        email: email,
        password: password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged In successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
    console.log(res.data);
  } catch (error) {
    showAlert('error', error.response.data.message);
  
  }
};


export const logOut = async () => {
  try {
    const res = await axios({
      method: 'get',
      url: 'http://localhost:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged Out successfully');
      localStorage.removeItem('jwt');
      window.setTimeout(() => {
        location.reload(true);
      }, 1500);
    }
    console.log(res.data);
    
  } catch (error) {
    showAlert('error', 'Error logging out');
  }
    
}


// console.log(document);
