import { DEFAULT_AVATAR } from '@/constants';

async function efetch(url, options = {}) {
  let result = {};
  let json = {};

  try {
    result = await fetch(url, options);
    json = await result.json();
  } catch (error) {
    throw new Error(error.message);
  }

  if (!result.ok || json.status !== 'success') {
    throw new Error(json.message);
  }

  return json.data;
}

function makeContactsService() {
  const baseUrl = '/api/v1/contacts';

  async function fetchContacts(page = 1, limit = 5) {
    const url = `${baseUrl}?page=${page}&limit=${limit}`;
    const data = await efetch(url); // data là { contacts, metadata }

    const contacts = data.contacts.map((contact) => ({
      ...contact,
      avatar: contact.avatar ?? DEFAULT_AVATAR,
    }));

    return {
      contacts,
      totalPages: data.metadata?.lastPage ?? 1,
    };
  }

  async function fetchContact(id) {
    const { contact } = await efetch(`${baseUrl}/${id}`);
    return {
      ...contact,
      avatar: contact.avatar ?? DEFAULT_AVATAR,
    };
  }

  async function createContact(contact) {
    return efetch(baseUrl, {
      method: 'POST',
      body: contact,
    });
  }

  async function deleteAllContacts() {
    return efetch(baseUrl, {
      method: 'DELETE',
    });
  }

  async function updateContact(id, contact) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'PUT',
      body: contact,
    });
  }

  async function deleteContact(id) {
    return efetch(`${baseUrl}/${id}`, {
      method: 'DELETE',
    });
  }

  return {
    fetchContacts,
    fetchContact,
    createContact,
    updateContact,
    deleteContact,
    deleteAllContacts,
  };
}

export default makeContactsService();
