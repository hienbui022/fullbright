import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
        <footer className="py-4 px-6 text-center text-gray-500 text-sm border-t">
          &copy; {new Date().getFullYear()} English Fullbright. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout; 