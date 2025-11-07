
import type { RouteObject } from "react-router-dom";
import HomePage from '../pages/home/page';
import SharePage from '../pages/share/page';
import NotFound from '../pages/NotFound';

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/share',
    element: <SharePage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
