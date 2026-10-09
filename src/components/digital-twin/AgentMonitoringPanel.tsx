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

        {/* 지금 현재 위치 업데이트 함수인 updateAgentPosition이 16ms  마다 호출 */}
        {/* 60fps(초당 60프레임)에서 디스플레이의 프레임 전환 간격이 약 16ms(밀리초)인
            이유는 1초를 60개로 나누었을 때 나오는 시간 단위이기 때문
            수학적으로 계산하면 다음과 같습니다.
            • 1초 = 1,000ms (밀리초)
            • 1,000ms ÷ 60프레임 = 16.6666...ms */}
        {/* 성능 최적화 포인트가 될 거 같음 근데 실시간 위치가 react 단에 ui로 보여지는게 중요한거 아닌가 */}

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
