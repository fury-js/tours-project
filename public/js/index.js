/* eslint-disable */

import '@babel/polyfill'
import { login, logOut } from './login'
import { updateSettings } from './updateSettings';
import { displayMap } from './mapbox';

// Dom elements
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-password');



// values



// delegation
if(mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);

}

if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
    })
}

if(logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        logOut();
    })
}

if (updateForm) {
    updateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const image = document.getElementById('photo').files[0];

        const form = new FormData();
        form.append('name', name )
        form.append('email', email);
        form.append('photo', image);

        console.log(form)

        updateSettings(form, 'data');
    })
}

if (updatePasswordForm) {
    updatePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('password-current').value;
    const newPassword = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;

    updateSettings({ currentPassword, newPassword, passwordConfirm }, 'password');
  });
}



