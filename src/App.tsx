import DigitalTwinScene from './components/digital-twin/DigitalTwinScene';
import MonitoringPanel from './components/digital-twin/MonitoringPanel';

function App() {
  return (
    <main className='relative h-screen w-screen'>
      <DigitalTwinScene />
      <MonitoringPanel />
    </main>
  );
}

export default App;
