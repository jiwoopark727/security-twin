import { useSecurityStore } from '../../store/securityStore';
import { securityAgents, type SecurityAgent } from '../../data/mockData';

const getAgentTypeLabel = (type: SecurityAgent['type']) => {
  switch (type) {
    case 'guard':
      return '경비원';

    case 'patrol-robot':
      return '무인 순찰 로봇';

    case 'drone':
      return '드론';
  }
};

const AgentMonitoringPanel = () => {
  const selectedAgentId = useSecurityStore((state) => state.selectedAgentId);

  const agentPositions = useSecurityStore((state) => state.agentPositions);

  const agentStatuses = useSecurityStore((state) => state.agentStatuses);

  if (!selectedAgentId) {
    return null;
  }

  const selectedAgent = securityAgents.find(
    (agent) => agent.id === selectedAgentId,
  );

  if (!selectedAgent) {
    return null;
  }

  const position = agentPositions[selectedAgent.id];
  const status = agentStatuses[selectedAgent.id];

  return (
    <div className='absolute right-4 bottom-4 w-72 rounded-xl bg-black/80 p-5 text-white shadow-xl backdrop-blur'>
      <div className='mb-4'>
        <h2 className='text-lg font-bold'>{selectedAgent.name}</h2>

        <p className='mt-1 text-sm text-gray-400'>{selectedAgent.id}</p>
      </div>

      <div className='space-y-3 text-sm'>
        <div>
          <span className='text-gray-400'>유형</span>
          <p className='mt-1'>{getAgentTypeLabel(selectedAgent.type)}</p>
        </div>

        <div>
          <span className='text-gray-400'>상태</span>
          <div className='mt-1 ml-2 inline-flex rounded-full bg-white/10 px-3 pt-1 pb-1.5 text-sm'>
            {status}
          </div>
        </div>

        <div>
          <span className='text-gray-400'>현재 위치</span>

          <div className='mt-1 space-y-1 text-xs text-gray-300'>
            <p>X: {position?.x.toFixed(2)}</p>
            <p>Y: {position?.y.toFixed(2)}</p>
            <p>Z: {position?.z.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMonitoringPanel;
