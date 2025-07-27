<script setup>
import { useRouter } from 'vue-router';
import { useMutation, useQueryClient } from '@tanstack/vue-query';
import ContactForm from '@/components/ContactForm.vue';
import contactsService from '@/services/contacts.service';

const router = useRouter();
const queryClient = useQueryClient();

const DEFAULT_CONTACT = {
  name: '',
  email: '',
  address: '',
  phone: '',
  favorite: 0,
  avatar: '/images/default-avatar.png',
};

const { mutate: createContact, isLoading } = useMutation({
  mutationFn: contactsService.createContact,
  onSuccess: () => {
    queryClient.invalidateQueries(['contacts']);
    router.push({ name: 'contactbook' });
  },
  onError: (error) => {
    console.error('Lỗi khi thêm liên hệ:', error);
    alert('Có lỗi xảy ra khi thêm liên hệ.');
  },
});

const handleContactSubmit = (contactFormData) => {
  createContact(contactFormData);
};
</script>

<template>
  <div class="page">
    <h4>Thêm Liên hệ mới</h4>
    <ContactForm
      :contact="DEFAULT_CONTACT"
      :loading="isLoading"
      @submit:contact="handleContactSubmit"
    />
  </div>
</template>

<style scoped>
.page {
  text-align: left;
  max-width: 750px;
}
</style>
