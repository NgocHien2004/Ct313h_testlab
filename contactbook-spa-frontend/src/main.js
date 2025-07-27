import router from './router';
import { createApp } from 'vue';
import App from './App.vue';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const app = createApp(App);

app.use(router);
app.use(VueQueryPlugin, { queryClient });
app.mount('#app');
