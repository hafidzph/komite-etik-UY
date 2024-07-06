import axiosInstance from "../utils/axiosInstance";

export async function getDocumentsByUser(filter) {
  try {
    const response = await axiosInstance.get(
      `/documents/user?filter=${filter}`
    );
    return response.data.data.documents;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getDocuments(filter) {
  try {
    const response = await axiosInstance.get(`/documents?filter=${filter}`);
    return response.data.data.documents;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function getDocument(id) {
  try {
    const response = await axiosInstance.get(`/documents/${id}`);
    return response.data.data.document;
  } catch (err) {
    throw new Error(err.message);
  }
}

export async function uploadDocument(formData) {
  try {
    const response = await axiosInstance.post(`/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log("Error", error.message);
    }
    throw new Error(error);
  }
}

export async function updateDocument({ formData, id }) {
  try {
    const response = await axiosInstance.patch(`/documents/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export async function updateFormSurat({ formData, id }) {
  try {
    const response = await axiosInstance.patch(
      `/documents/${id}/formSurat`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error);
  }
}

export async function addReviewers({ reviewers, id }) {
  try {
    const response = await axiosInstance.patch(
      `/documents/${id}/reviewers`,
      { reviewers },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error.response.data.message);
    throw new Error(error.message);
  }
}

export async function updateStatusReviewers({ status, message, id }) {
  try {
    const response = await axiosInstance.patch(
      `/documents/${id}/status`,
      { status, message },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error.response.data.message);
    throw new Error(error.message);
  }
}

export async function sendStatus({ status, id }) {
  try {
    const response = await axiosInstance.patch(
      `/documents/${id}/status/send`,
      { status },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response;
  } catch (error) {
    console.log(error.response.data.message);
    throw new Error(error.message);
  }
}
