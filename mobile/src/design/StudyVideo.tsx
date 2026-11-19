import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useEvent } from 'expo';
import Feather from '@expo/vector-icons/Feather';
import { useVideoPlayer, VideoView, type VideoSource } from 'expo-video';
import { Button, Notice, ResourceState, Typography } from './components';
import { tokens as t } from './tokens';

function Player({ uri }: { uri: VideoSource }) {
  const player = useVideoPlayer(uri, (instance) => {
    instance.play();
  });
  const { status } = useEvent(player, 'statusChange', {
    status: player.status,
  });
  return (
    <View style={{ gap: t.space.sm }}>
      <VideoView
        player={player}
        nativeControls
        contentFit="contain"
        fullscreenOptions={{ enable: true }}
        accessibilityLabel="EMA study guide video"
        style={{
          width: '100%',
          aspectRatio: 16 / 9,
          backgroundColor: t.color.text,
        }}
      />
      {status === 'loading' && <ResourceState loading />}
      {status === 'error' && (
        <>
          <Notice message="The video could not load. Check your connection and try again." />
          <Button
            label="Retry video"
            variant="secondary"
            onPress={() => {
              void player.replaceAsync(uri).catch(() => {});
            }}
          />
        </>
      )}
    </View>
  );
}

export function StudyVideo() {
  const [opened, setOpened] = useState(false);
  const uri = process.env.EXPO_PUBLIC_STUDY_VIDEO_URL?.trim();
  const configured = !!uri && /^https:\/\//i.test(uri);
  return (
    <View style={{ gap: t.space.sm }}>
      {opened ? (
        <Player
          uri={configured ? uri : require('../../assets/study-placeholder.mp4')}
        />
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Play study guide video"
          accessibilityHint="Plays the EMA study guide with video controls"
          onPress={() => setOpened(true)}
          style={({ pressed }) => [s.preview, pressed && { opacity: 0.85 }]}
        >
          <View style={s.eyebrow}>
            <Feather
              name="video"
              size={t.size.icon}
              color={t.color.primary}
              accessible={false}
            />
            <Typography variant="small" style={{ color: t.color.primary }}>
              Study video guide
            </Typography>
          </View>
          <Typography variant="title">How to use the application</Typography>
          <Typography style={{ color: t.color.muted }}>
            Learn about your three check-ins and choose times that fit your
            routine, including overnight.
          </Typography>
          <View style={s.play} pointerEvents="none">
            <Feather
              name="play"
              size={t.size.icon}
              color={t.color.primary}
              accessible={false}
            />
            <Typography variant="button" style={{ color: t.color.primary }}>
              Play video
            </Typography>
          </View>
        </Pressable>
      )}
    </View>
  );
}
const s = StyleSheet.create({
  preview: {
    backgroundColor: t.color.page,
    borderWidth: 1,
    borderColor: t.color.border,
    borderRadius: t.radius.card,
    padding: t.space.xl,
    gap: t.space.lg,
  },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: t.space.sm },
  play: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.space.sm,
    minHeight: t.size.touch,
    backgroundColor: t.color.surface,
    borderWidth: 1,
    borderColor: t.color.primary,
    borderRadius: t.radius.control,
    paddingHorizontal: t.space.lg,
    paddingVertical: t.space.md,
  },
});
