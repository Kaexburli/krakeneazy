import { writable } from 'svelte/store';

const storedUser = JSON.parse(localStorage.getItem("user")) || false;

export const User = function () {
  const { subscribe, set } = writable(storedUser);
  return {
    subscribe,
    signout: () => localStorage.setItem("user", false),
    signin: (user) => localStorage.setItem("user", JSON.stringify(user))
  }
}()