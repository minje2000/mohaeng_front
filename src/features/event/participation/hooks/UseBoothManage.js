import { useCallback, useEffect, useState } from 'react';

import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

export default function UseBoothManage() {
  const [received, setReceived] = useState([]);
  const [applied, setApplied] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [recv, appl] = await Promise.all([
        ParticipationBoothApi.getMyReceivedBoothList(),
        ParticipationBoothApi.getMyAppliedBoothList(),
      ]);
      setReceived(Array.isArray(recv) ? recv : []);
      setApplied(Array.isArray(appl) ? appl : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    received,
    applied,
    loading,
    refresh: load,
  };
}
