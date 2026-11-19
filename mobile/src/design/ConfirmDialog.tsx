import { Modal, StyleSheet, View } from 'react-native';
import { Button, Typography } from './components';
import { tokens as t } from './tokens';
export function ConfirmDialog({
  visible,
  onCancel,
  onConfirm,
  title = 'Leave this check-in?',
  message = 'Your answers will be discarded. You can start this check-in again from Home.',
  cancelLabel = 'Keep answering',
  confirmLabel = 'Discard answers',
}: {
  title?: string;
  message?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={s.backdrop}>
        <View style={s.dialog} accessibilityViewIsModal>
          <Typography variant="title" accessibilityRole="header">
            {title}
          </Typography>
          <Typography>{message}</Typography>
          <Button label={cancelLabel} onPress={onCancel} />
          <Button
            label={confirmLabel}
            variant="secondary"
            onPress={onConfirm}
          />
        </View>
      </View>
    </Modal>
  );
}
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: t.space.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: t.size.maxContent,
    alignSelf: 'center',
    padding: t.space.xl,
    gap: t.space.xl,
    backgroundColor: t.color.surface,
    borderRadius: t.radius.card,
  },
});
