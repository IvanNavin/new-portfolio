import { useTranslation } from '@i18n/client';
import { useHover } from '@mantine/hooks';
import { FormEvent, useEffect, useState } from 'react';

export const useContact = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [errorName, setErrorName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const { t } = useTranslation();
  const { hovered, ref } = useHover<HTMLButtonElement>();

  const reset = () => {
    setErrorName('');
    setErrorMessage('');
    setSuccess(null);
    setError('');
    setName('');
    setMessage('');
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setErrorName('Name is too short');
      return;
    }

    if (message.trim().length < 2) {
      setErrorMessage('Message is too short');
      return;
    }

    setSent(true);

    const startTime = Date.now();

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, message }),
    });

    const endTime = Date.now();
    const fetchDuration = endTime - startTime;
    // If the request time is more than 1 second, delay will be 0
    const delay = Math.max(1000 - fetchDuration, 0);

    setTimeout(async () => {
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setName('');
          setMessage('');
          setSuccess(true);

          setTimeout(() => {
            reset();
          }, 5000);
        } else {
          setError('Something went wrong');
        }
      } else {
        setError('Something went wrong');
      }

      setSent(false);
    }, delay);
  };

  useEffect(() => {
    if (errorName) {
      setErrorName('');
    }
    if (errorMessage) {
      setErrorMessage('');
    }
    if (error) {
      setError('');
    }
  }, [name, message]);

  useEffect(() => reset, []);

  return {
    t,
    onSubmit,
    name,
    setName,
    errorName,
    message,
    errorMessage,
    setMessage,
    ref,
    sent,
    success,
    hovered,
  };
};
