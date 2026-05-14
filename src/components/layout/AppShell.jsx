import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar.jsx';
import { Topbar } from './Topbar.jsx';
import { AssistantPanel } from '../ai/AssistantPanel.jsx';

export function AppShell() {
  const [sidebar, setSidebar] = useState(false);
  const [assistant, setAssistant] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebar} onClose={() => setSidebar(false)} />
      <div className="lg:pl-72">
        <Topbar
          onOpenSidebar={() => setSidebar(true)}
          onOpenAssistant={() => setAssistant(true)}
        />
        <main className="px-4 py-5 sm:px-6 sm:py-7">
          <Outlet />
        </main>
      </div>
      <AssistantPanel open={assistant} onClose={() => setAssistant(false)} />
    </div>
  );
}
