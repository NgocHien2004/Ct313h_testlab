<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import ContactForm from '@/components/ContactForm.vue';
import contactsService from '@/services/contacts.service';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const contactId = route.params.id;

const { data: contactData, isLoading } = useQuery({
  queryKey: ['contact', contactId],
  queryFn: () => contactsService.fetchContact(contactId),
  retry: false,
  onError: () => {
    router.push({
      name: 'notfound',
      params: { pathMatch: route.path.split('/').slice(1) },
      query: route.query,
      hash: route.hash,
    });
  },
});

const updateContactMutation = useMutation({
  mutationFn: (formData) => contactsService.updateContact(contactId, formData),
  onSuccess: () => {
    queryClient.invalidateQueries(['contacts']);
    alert('Liên hệ được cập nhật thành công.');
  },
  onError: (error) => {
    console.error('Lỗi khi cập nhật:', error);
    alert('Có lỗi khi cập nhật liên hệ.');
  },
});

const deleteContactMutation = useMutation({
  mutationFn: () => contactsService.deleteContact(contactId),
  onSuccess: () => {
    queryClient.invalidateQueries(['contacts']);
    router.push({ name: 'contactbook' });
  },
  onError: (error) => {
    console.error('Lỗi khi xóa:', error);
    alert('Không thể xóa liên hệ.');
  },
});

function onUpdateContact(formData) {
  updateContactMutation.mutate(formData);
}

function onDeleteContact() {
  if (confirm('Bạn muốn xóa Liên hệ này?')) {
    deleteContactMutation.mutate();
  }
}
</script>

<template>
  <div class="page">
    <h4>Hiệu chỉnh Liên hệ</h4>

    <div v-if="isLoading">Đang tải dữ liệu...</div>

    <ContactForm
      v-else-if="contactData"
      :contact="contactData"
      @submit:contact="onUpdateContact"
      @delete:contact="onDeleteContact"
    />

    <p v-else class="alert alert-danger">Không tìm thấy liên hệ.</p>
  </div>
</template>

<style scoped>
.page {
  text-align: left;
  max-width: 750px;
}
</style>
