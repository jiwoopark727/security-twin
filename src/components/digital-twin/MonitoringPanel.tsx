import { useSecurityStore } from '../../store/securityStore';
import { facilities } from '../../data/mockData';

export default function MonitoringPanel() {
  const selectedFacilityId = useSecurityStore(
    (state) => state.selectedFacilityId,
  );

  const selectedFacility = facilities.find(
    (facility) => facility.id === selectedFacilityId,
  );

  if (!selectedFacility) {
    return (
      <aside className='absolute right-4 top-4 w-64 rounded-lg bg-black/80 p-4 text-white'>
        <h2 className='mb-2 text-lg font-semibold'>시설 모니터링</h2>

        <p className='text-sm text-gray-400'>시설물을 선택해주세요.</p>
      </aside>
    );
  }

  return (
    <aside className='absolute right-4 top-4 w-64 rounded-lg bg-black/80 p-4 text-white'>
      <h2 className='mb-4 text-lg font-semibold'>시설 모니터링</h2>

      <div className='space-y-2 text-sm'>
        <div>
          <span className='text-gray-400'>
            시설명 : {selectedFacility.name}
          </span>
        </div>

        <div>
          <span className='text-gray-400'>
            시설 유형 : {selectedFacility.type}
          </span>
        </div>

        <div>
          <span className='text-gray-400'>
            상태 : {selectedFacility.status}
          </span>
        </div>

        <div>
          <span className='text-gray-400'>ID : {selectedFacility.id}</span>
        </div>
      </div>
    </aside>
  );
}
