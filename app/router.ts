import { Application } from 'egg';

export default (app: Application) => {
  const { controller, router } = app;

  router.get('/', controller.home.index);
  router.get('/api/search', controller.api.search);
  router.get('/api/version', controller.api.version);
  router.get('/api/files', controller.api.files);
  router.get('/api/sync', controller.sync.do);
};
