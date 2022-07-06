/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';


export const updateSettings = async (data, type) => {
    const url = type === 'password' ? 'http://localhost:3000/api/v1/users/updateMyPassword' : 'http://localhost:3000/api/v1/users/updateMe'


    try {
        const res = await axios({
            method: 'patch',
            url: url,
            data: data
        })

        if(res.data.status === 'success') {
            showAlert('success',  `${type.toUpperCase()} Updated successfully`);
            window.setTimeout(() => {
                location.reload(true);
            }, 1500);
        }
        
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
        

}

