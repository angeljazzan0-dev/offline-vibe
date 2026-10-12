import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable } from 'react-native';

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
}

export const InfiniteQueueModal: React.FC<QueueModalProps> = ({ visible, onClose }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Cola Infinita (Algoritmo Local)</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <Text style={styles.bodyText}>
            Las próximas 10 pistas se auto-generan adaptando tempo y energía sin repetición de artista.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#0c0c14',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    minHeight: 280,
    borderWidth: 1,
    borderColor: '#1e1b4b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 16,
  },
  bodyText: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
  },
});