import { useState } from 'react';
import { ParticipationApi } from '../api/ParticipationAPI';

export default function UseParticipationApply({ eventId, onDone }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (dto) => {
    setSubmitting(true);
    setError(null);
    try {
      await ParticipationApi.submitParticipation(eventId, dto);
      onDone?.();
    } catch (e) {
      setError(e);
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error };
}
