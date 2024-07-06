import axios from "axios";
import axiosInstance from "../utils/axiosInstance";

export async function getUser() {
  try {
    const response = await axiosInstance.get(`/users/user`);
    return response.data.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function getUsers() {
  try {
    const response = await axiosInstance.get(`/users`);
    return response.data.data.users;
  } catch (err) {
    throw new Error(err);
  }
}

export async function updatePhotoProfile(formData) {
  try {
    const response = await axiosInstance.patch(`/users/updatePhoto`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function updateName({ name }) {
  try {
    const response = await axiosInstance.patch(
      `/users/updateName`,
      { name },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err);
  }
}

export async function updatePassword({
  currentPassword,
  password,
  passwordConfirm,
}) {
  try {
    const response = await axiosInstance.patch(
      `/users/updatePassword`,
      { currentPassword, password, passwordConfirm },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err.response.data.message);
  }
}

export async function createUser({
  name,
  username,
  email,
  instance,
  role,
  password,
}) {
  try {
    const response = await axiosInstance.post(
      `/users`,
      { name, username, email, instance, role, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err.response.data.message);
  }
}

export async function updateUser({
  name,
  username,
  email,
  instance,
  role,
  password,
  id,
}) {
  try {
    const response = await axiosInstance.patch(
      `/users/${id}`,
      { name, username, email, instance, role, password },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  } catch (err) {
    throw new Error(err.response);
  }
}

export async function getUserById(id) {
  try {
    const response = await axiosInstance.get(`/users/${id}`);
    return response.data.data.user;
  } catch (err) {
    throw new Error(err);
  }
}

export async function deleteUser(id) {
  try {
    const response = await axiosInstance.delete(`/users/${id}`);
    return response.data;
  } catch (err) {
    throw new Error(err);
  }
}
