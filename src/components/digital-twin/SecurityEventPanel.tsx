import { useSecurityStore } from '../../store/securityStore';
import { useStrangerStore } from '../../store/strangerStore';
import { useEffect, useState } from 'react';

// SecurityEventPanel은 이벤트 상태를 직접 보관하지 x
// Zustand에서 상태를 읽고 액션을 호출하는 역할만 함
const SecurityEventPanel = () => {
  const activeSecurityEvent = useSecurityStore(
    (state) => state.activeSecurityEvent,
  );

  const triggerIntrusion = useSecurityStore((state) => state.triggerIntrusion);

  const resolveSecurityEvent = useSecurityStore(
    (state) => state.resolveSecurityEvent,
  );

  const strangerOn = useStrangerStore((state) => state.strangerOn);
  const strangerOff = useStrangerStore((state) => state.strangerOff);

  const robotStatus = useSecurityStore(
    (state) => state.agentStatuses['robot-01'],
  );

  const [canResolve, setCanResolve] = useState(false);

  useEffect(() => {
    if (robotStatus !== '대응중🟠') {
      return;
    }

    const timer = setTimeout(() => {
      setCanResolve(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [robotStatus]);

  return (
    <div className='absolute left-4 top-4 z-10 w-80 rounded-xl border border-white/10 bg-gray-950/90 p-5 text-white shadow-xl backdrop-blur'>
      <div className='mb-4 flex items-center justify-between'>
        <h2 className='text-lg font-bold'>보안 이벤트 관제</h2>

        <span className='rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400'>
          SECURITY
        </span>
      </div>

      {!activeSecurityEvent || activeSecurityEvent.status === '해결' ? (
        <div className='space-y-3'>
          <p className='text-sm text-gray-400'>
            현재 진행 중인 보안 이벤트가 없습니다.
          </p>

          <button
            onClick={() => {
              triggerIntrusion();
              strangerOn();
            }}
            className='w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold transition hover:bg-red-500'
          >
            🚨 침입 이벤트 발생
          </button>
        </div>
      ) : (
        <div className='space-y-4'>
          <div className='rounded-lg border border-red-500/30 bg-red-500/10 p-3'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='font-semibold text-red-400'>🚨 침입 감지</span>

              <span className='rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-300'>
                {activeSecurityEvent.status}
              </span>
            </div>

            <p className='text-sm text-gray-200'>
              {activeSecurityEvent.message}
            </p>

            <p className='mt-2 text-xs text-gray-400'>
              발생 시각: {activeSecurityEvent.createdAt}
            </p>
          </div>

          <div className='space-y-1 text-sm'>
            <p className='text-gray-400'>침입 위치</p>

            <p>
              X: {activeSecurityEvent.position.x}
              {' / '}
              Y: {activeSecurityEvent.position.y}
              {' / '}
              Z: {activeSecurityEvent.position.z}
            </p>
          </div>

          <button
            disabled={!canResolve}
            onClick={() => {
              if (!canResolve) return;

              resolveSecurityEvent();
              strangerOff();
            }}
            className={`w-full rounded-lg px-4 py-3 text-sm font-semibold transition ${
              canResolve
                ? 'bg-green-600 text-white hover:bg-green-500'
                : 'cursor-not-allowed bg-gray-700 text-gray-400'
            }`}
          >
            {!canResolve
              ? activeSecurityEvent.status === '발생'
                ? '🟣 출동 중...'
                : '🟠 대응 중...'
              : '✓ 이벤트 해결 처리'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SecurityEventPanel;
