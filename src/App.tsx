import AgentMonitoringPanel from './components/digital-twin/AgentMonitoringPanel';
import DigitalTwinScene from './components/digital-twin/DigitalTwinScene';
import MonitoringPanel from './components/digital-twin/MonitoringPanel';
import SecurityEventPanel from './components/digital-twin/SecurityEventPanel';

function App() {
  return (
    <main className='relative h-screen w-screen'>
      <DigitalTwinScene />

      <MonitoringPanel />

      <AgentMonitoringPanel />

      <SecurityEventPanel />
    </main>
  );
}

export default App;
