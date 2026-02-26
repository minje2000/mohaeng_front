import { useState } from 'react';
import { ParticipationBoothApi } from '../api/ParticipationBoothAPI';

export default function UseParticipationBoothApply({ eventId, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (dto) => {
    setSubmitting(true);
    setError(null);
    try {
      await ParticipationBoothApi.submitBoothApply(eventId, dto);
      onDone?.();
    } catch (e) {
      setError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
