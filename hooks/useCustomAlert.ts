import { useState, useCallback } from 'react';

type AlertButton = { text: string; onPress?: () => void; style?: 'cancel' | 'default' | 'destructive' };

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export function useCustomAlert() {
  const [alert, setAlert] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = useCallback(
    (title: string, message: string, buttons?: AlertButton[]) => {
      setAlert({
        visible: true,
        title,
        message,
        buttons: buttons || [
          {
            text: 'Tamam',
            onPress: () => setAlert(prev => ({ ...prev, visible: false })),
          },
        ],
      });
    },
    []
  );

  const hideAlert = useCallback(() => {
    setAlert(prev => ({ ...prev, visible: false }));
  }, []);

  return { alert, showAlert, hideAlert };
}
