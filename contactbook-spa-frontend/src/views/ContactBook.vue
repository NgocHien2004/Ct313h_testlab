<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query';
import ContactCard from '@/components/ContactCard.vue';
import InputSearch from '@/components/InputSearch.vue';
import ContactList from '@/components/ContactList.vue';
import MainPagination from '@/components/MainPagination.vue';
import contactsService from '@/services/contacts.service';

const router = useRouter();
const route = useRoute();
const queryClient = useQueryClient();

const selectedIndex = ref(-1);
const searchText = ref('');

const currentPage = computed(() => {
  const page = Number(route.query.page);
  return Number.isNaN(page) || page < 1 ? 1 : page;
});

const LIMIT = 5;

const { data, isLoading, isError, error, isFetching, refetch } = useQuery({
  queryKey: ['contacts', currentPage.value],
  queryFn: () => contactsService.fetchContacts(currentPage.value, LIMIT),
  keepPreviousData: true,
  onSuccess: (responseData) => {
    console.log('Query onSuccess - Dữ liệu nhận được:', responseData);
  },
  onError: (queryError) => {
    console.error('Query onError - Lỗi:', queryError);
  },
});

console.log('--- Trạng thái ContactBook Component (lúc script chạy) ---');
console.log('data.value (từ useQuery):', data.value);
console.log('isLoading.value:', isLoading.value);
console.log('isFetching.value:', isFetching.value);
console.log('isError.value:', isError.value, 'Error object:', error.value);
console.log('contacts.value (computed từ data):', data.value?.contacts || []);
console.log(
  'filteredContacts.value:',
  (data.value?.contacts || []).filter((contact) =>
    ['name', 'email', 'address', 'phone']
      .map((key) => contact[key])
      .join('')
      .toLowerCase()
      .includes(searchText.value.toLowerCase()),
  ),
);
console.log('totalPages.value:', data.value?.totalPages || 1);
console.log('------------------------------------------------------');

const contacts = computed(() => data.value?.contacts || []);
const totalPages = computed(() => data.value?.totalPages || 1);

const searchableContacts = computed(() =>
  contacts.value.map(({ name, email, address, phone }) =>
    [name, email, address, phone].join('').toLowerCase(),
  ),
);

const filteredContacts = computed(() => {
  if (!searchText.value) return contacts.value;
  return contacts.value.filter((_, index) =>
    searchableContacts.value[index].includes(searchText.value.toLowerCase()),
  );
});

const selectedContact = computed(() => {
  if (selectedIndex.value < 0 || selectedIndex.value >= filteredContacts.value.length) return null;
  return filteredContacts.value[selectedIndex.value];
});

const deleteAllMutation = useMutation({
  mutationFn: () => contactsService.deleteAllContacts(),
  onSuccess: () => {
    queryClient.invalidateQueries(['contacts']);
    selectedIndex.value = -1;
  },
});

function goToAddContact() {
  try {
    router.push({ name: 'contact.add' });
  } catch (error) {
    console.error('Không thể chuyển hướng:', error);
  }
}

function changeCurrentPage(page) {
  if (page !== currentPage.value) {
    router.push({ name: 'contactbook', query: { page } });
  }
}

function onDeleteContacts() {
  if (confirm('Bạn có chắc muốn xóa tất cả?')) {
    deleteAllMutation.mutate();
  }
}

watch(searchText, () => {
  selectedIndex.value = -1;
});

watch(
  () => route.query.page,
  () => {
    refetch();
  },
);

onMounted(() => {
  console.log('ContactBook Component Mounted. Kiểm tra trạng thái ban đầu:');
  console.log('  isLoading:', isLoading.value);
  console.log('  isFetching:', isFetching.value);
  console.log('  data:', data.value);
  console.log('  contacts.value (trong onMounted):', contacts.value);
});
</script>

<template>
  <div class="page row mb-5">
    <div class="mt-3 col-md-6">
      <h4>Danh bạ <i class="fas fa-address-book"></i></h4>

      <div class="my-3">
        <InputSearch v-model="searchText" />
      </div>

      <div v-if="isLoading" class="alert alert-info">
        <i class="fas fa-spinner fa-spin"></i> Đang tải danh bạ...
      </div>

      <ContactList
        v-if="!isLoading && filteredContacts.length > 0"
        :contacts="filteredContacts"
        v-model:selected-index="selectedIndex"
      />
      <p v-else-if="!isLoading">Không có liên hệ nào.</p>

      <div class="mt-3 row justify-content-around align-items-center">
        <MainPagination
          v-if="typeof totalPages === 'number' && totalPages >= 1"
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:currentPage="changeCurrentPage"
        />

        <div class="col-auto">
          <button class="btn btn-sm btn-secondary me-2" @click="refetch()">
            <i class="fas fa-redo"></i> Làm mới
          </button>
          <button class="btn btn-sm btn-primary" @click="goToAddContact">
            <i class="fas fa-plus"></i> Thêm mới
          </button>
          <button class="btn btn-sm btn-danger ms-2" @click="onDeleteContacts">
            <i class="fas fa-trash"></i> Xóa tất cả
          </button>
        </div>
      </div>
    </div>

    <div class="mt-3 col-md-6" v-if="selectedContact">
      <h4>Chi tiết Liên hệ <i class="fas fa-address-card"></i></h4>
      <ContactCard :contact="selectedContact" />

      <router-link
        v-if="selectedContact?.id"
        :to="{ name: 'contact.edit', params: { id: selectedContact.id } }"
      >
        <span class="mt-2 badge text-bg-warning"> <i class="fas fa-edit"></i> Hiệu chỉnh </span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.page {
  text-align: left;
  max-width: 750px;
}
</style>
