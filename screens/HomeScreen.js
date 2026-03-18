import React, { useContext, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Animated, Easing, Alert, Platform
} from 'react-native';
import { TamagotchiContext, MARKET_ITEMS } from '../context/TamagotchiContext';

const HomeScreen = () => {
  const {
    isim, tur, emoji, aclik, mutluluk, level, xp, hastami,
    envanter, esyaKullan, isLoaded, animTetikle, isDarkMode,
    uygulamayiSifirla, getGerekenXp
  } = useContext(TamagotchiContext);

  const floatAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0.6)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const aclikAnim  = useRef(new Animated.Value(0)).current;
  const mutlulukAnim = useRef(new Animated.Value(0)).current;

  // Floating
  useEffect(() => {
    if (!isLoaded) return;
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -18, duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
  }, [isLoaded]);

  // Glow pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1200, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Card pulse
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.012, duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,     duration: 2000, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Pop on interaction
  useEffect(() => {
    if (animTetikle > 0) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.35, speed: 22, bounciness: 14, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1,    speed: 12, bounciness: 8,  useNativeDriver: true }),
      ]).start();
    }
  }, [animTetikle]);

  // Stat bar animations
  useEffect(() => {
    Animated.timing(aclikAnim,   { toValue: aclik / 100,   duration: 600, useNativeDriver: false }).start();
    Animated.timing(mutlulukAnim, { toValue: mutluluk / 100, duration: 600, useNativeDriver: false }).start();
  }, [aclik, mutluluk]);

  if (!isLoaded) {
    return (
      <View style={[styles.loadingContainer, isDarkMode && { backgroundColor: '#0d0d0d' }]}>
        <Text style={{ fontSize: 40 }}>🥚</Text>
        <Text style={{ fontSize: 16, color: isDarkMode ? '#b2bec3' : '#636e72', marginTop: 14, fontWeight: '700' }}>
          Yükleniyor...
        </Text>
      </View>
    );
  }

  const isHungry   = aclik > 70;
  const sadMi      = mutluluk < 30;
  const textColor  = isDarkMode ? '#f1f2f6' : '#2d3436';
  const subColor   = isDarkMode ? '#b2bec3' : '#636e72';
  const gerekenXp  = getGerekenXp(level);
  const xpYuzde    = Math.min(1, xp / gerekenXp);

  const cardBg = isDarkMode
    ? (isHungry ? '#3a0d0d' : '#1a1a2e')
    : (isHungry ? '#fff0f0' : '#ffffff');
  const containerBg = isDarkMode ? '#0d0d0d' : '#f0f4ff';

  const sahipOlunanAcalar = Object.keys(envanter).filter(id => envanter[id] > 0 && MARKET_ITEMS[id]);

  const handleReset = () => {
    if (Platform.OS === 'web') {
      const onay = window.confirm("Tüm ilerleme silinecek, emin misin?");
      if (onay) uygulamayiSifirla();
    } else {
      Alert.alert(
        "Emin Misin? 🗑️",
        "Tüm altınların, seviyen, envanterin ve başarımların silinecek. Bu işlem geri alınamaz!",
        [
          { text: "İptal", style: "cancel" },
          { text: "Evet, Sıfırla", onPress: () => uygulamayiSifirla(), style: "destructive" }
        ]
      );
    }
  };

  const aclikColor = aclikAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: ['#00b894', '#fdcb6e', '#d63031'] });
  const mutlulukColor = mutlulukAnim.interpolate({ inputRange: [0, 0.3, 1], outputRange: ['#d63031', '#fdcb6e', '#00b894'] });

  return (
    <View style={[styles.container, { backgroundColor: containerBg }]}>

      {/* Renkli arka plan daireleri / dekorasyon */}
      <View style={[styles.bgCircle1, isDarkMode && { backgroundColor: 'rgba(9,132,227,0.08)' }]} />
      <View style={[styles.bgCircle2, isDarkMode && { backgroundColor: 'rgba(108,92,231,0.06)' }]} />

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        {/* KARAKTER KARTI */}
        <Animated.View style={[styles.card, { backgroundColor: cardBg, transform: [{ scale: pulseAnim }] },
          isDarkMode && styles.cardDarkShadow
        ]}>

          {/* Level & XP */}
          <View style={styles.levelRow}>
            <View style={[styles.levelBadge, isHungry && { backgroundColor: '#d63031' }]}>
              <Text style={styles.levelBadgeText}>LV {level}</Text>
            </View>
            <View style={styles.xpBarWrapper}>
              <View style={[styles.xpBarBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
                <View style={[styles.xpBarFill, { width: `${xpYuzde * 100}%` }]} />
              </View>
              <Text style={[styles.xpLabel, { color: subColor }]}>{xp} / {gerekenXp} XP</Text>
            </View>
          </View>

          {/* Glow aura + emoji */}
          <View style={styles.emojiWrapper}>
            <Animated.View style={[styles.glowRing, { opacity: glowAnim },
              hastami && { borderColor: '#fdcb6e', shadowColor: '#fdcb6e' },
              isHungry && !hastami && { borderColor: '#d63031', shadowColor: '#d63031' },
              isDarkMode && !hastami && !isHungry && { borderColor: '#6c5ce7' }
            ]} />
            <Animated.Text
              style={[
                styles.emoji,
                { transform: [{ translateY: floatAnim }, { scale: scaleAnim }] },
                hastami && { opacity: 0.55 },
              ]}
            >
              {emoji || '🥚'}
            </Animated.Text>
          </View>

          <View style={styles.namePlate}>
            <Text style={[styles.petName, { color: textColor }]}>{isim}</Text>
            <View style={[styles.turBadge, isDarkMode && { backgroundColor: 'rgba(108,92,231,0.25)', borderColor: '#6c5ce7' }]}>
              <Text style={[styles.turText, isDarkMode && { color: '#a29bfe' }]}>{tur}</Text>
            </View>
          </View>

          {/* STAT BARLAR */}
          <View style={[styles.statsCard, isDarkMode && { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            {/* Açlık */}
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subColor }]}>🍽 Açlık</Text>
              <View style={[styles.statBarBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
                <Animated.View style={[styles.statBarFill, { width: aclikAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%']}), backgroundColor: aclikColor }]} />
              </View>
              <Text style={[styles.statNum, { color: isHungry ? '#d63031' : textColor }]}>{aclik}</Text>
            </View>
            {/* Mutluluk */}
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subColor }]}>😊 Mutluluk</Text>
              <View style={[styles.statBarBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
                <Animated.View style={[styles.statBarFill, { width: mutlulukAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%']}), backgroundColor: mutlulukColor }]} />
              </View>
              <Text style={[styles.statNum, { color: sadMi ? '#d63031' : textColor }]}>{mutluluk}</Text>
            </View>
            {/* Sağlık */}
            <View style={styles.statRow}>
              <Text style={[styles.statLabel, { color: subColor }]}>❤️ Sağlık</Text>
              <View style={[styles.statBarBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
                <View style={[styles.statBarFill, { width: hastami ? '20%' : '100%', backgroundColor: hastami ? '#e17055' : '#00b894', borderRadius: 5 }]} />
              </View>
              <Text style={[styles.statNum, { color: hastami ? '#e17055' : '#00b894' }]}>
                {hastami ? '🤒' : '✅'}
              </Text>
            </View>
          </View>

        </Animated.View>

        {/* Uyarı mesajları */}
        {(isHungry || hastami || sadMi) && (
          <View style={[styles.alertBanner, isDarkMode && { backgroundColor: '#2d1a1a' }]}>
            {isHungry  && <Text style={styles.alertText}>⚠️ Evcil hayvanın çok acıkmış!</Text>}
            {hastami   && <Text style={styles.alertText}>🤒 Evcil hayvanın hasta, ilaç kullan!</Text>}
            {sadMi     && <Text style={styles.alertText}>😢 Evcil hayvanın mutsuz, oyna!</Text>}
          </View>
        )}

        <View style={{ height: 16 }} />

        {/* Reset butonu */}
        <TouchableOpacity style={styles.resetBtn} onPress={handleReset} activeOpacity={0.8}>
          <Text style={styles.resetBtnText}>🗑️ İlerlemeyi Sıfırla</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ENVANTER SIDEBAR */}
      {sahipOlunanAcalar.length > 0 && (
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
            {sahipOlunanAcalar.map(id => (
              <TouchableOpacity
                key={id}
                style={[styles.sidebarItem, isDarkMode && { backgroundColor: '#1e2a3a', borderColor: '#0984e3' }]}
                onPress={() => esyaKullan(id)}
                activeOpacity={0.7}
              >
                <Text style={styles.sidebarEmoji}>{MARKET_ITEMS[id].emoji}</Text>
                <View style={[styles.badge, isDarkMode && { borderColor: '#0d0d0d' }]}>
                  <Text style={styles.badgeText}>x{envanter[id]}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4ff',
  },
  container: {
    flex: 1, flexDirection: 'row',
  },
  bgCircle1: {
    position: 'absolute', width: 320, height: 320, borderRadius: 160,
    backgroundColor: 'rgba(9,132,227,0.06)',
    top: -60, left: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 250, height: 250, borderRadius: 125,
    backgroundColor: 'rgba(108,92,231,0.05)',
    bottom: 40, right: -60,
  },
  contentContainer: {
    alignItems: 'center', padding: 20, paddingTop: 28, flexGrow: 1, paddingRight: 80,
  },
  card: {
    width: '100%', maxWidth: 360, borderRadius: 32,
    padding: 24, alignItems: 'center',
    elevation: 12,
    shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20,
    borderWidth: 1, borderColor: 'rgba(108,92,231,0.12)',
  },
  cardDarkShadow: {
    borderColor: 'rgba(108,92,231,0.35)',
    shadowColor: '#6c5ce7', shadowOpacity: 0.45,
  },
  levelRow: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20,
  },
  levelBadge: {
    backgroundColor: '#0984e3', paddingHorizontal: 12, paddingVertical: 5,
    borderRadius: 12, elevation: 3,
  },
  levelBadgeText: {
    color: '#fff', fontWeight: '900', fontSize: 14,
  },
  xpBarWrapper: { flex: 1 },
  xpBarBg: {
    height: 10, backgroundColor: '#e0e7ff', borderRadius: 5, overflow: 'hidden', marginBottom: 3,
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
    borderRadius: 5,
  },
  xpLabel: {
    fontSize: 11, fontWeight: '700', textAlign: 'right',
  },
  emojiWrapper: {
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
  },
  glowRing: {
    position: 'absolute',
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 3, borderColor: '#0984e3',
    shadowColor: '#0984e3', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 24,
  },
  emoji: {
    fontSize: 88,
  },
  namePlate: {
    alignItems: 'center', marginBottom: 20, gap: 6,
  },
  petName: {
    fontSize: 26, fontWeight: '900',
  },
  turBadge: {
    backgroundColor: 'rgba(9,132,227,0.1)', paddingHorizontal: 14,
    paddingVertical: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(9,132,227,0.25)',
  },
  turText: {
    fontSize: 13, color: '#0984e3', fontWeight: '700',
  },
  statsCard: {
    width: '100%', backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: 20, padding: 16, gap: 14,
  },
  statRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  statLabel: {
    fontSize: 13, fontWeight: '700', width: 90,
  },
  statBarBg: {
    flex: 1, height: 10, backgroundColor: '#e0e7ff', borderRadius: 5, overflow: 'hidden',
  },
  statBarFill: {
    height: '100%', borderRadius: 5,
  },
  statNum: {
    fontSize: 14, fontWeight: '900', width: 30, textAlign: 'right',
  },
  alertBanner: {
    width: '100%', maxWidth: 360, backgroundColor: '#fff5f5',
    borderRadius: 16, padding: 14, gap: 6,
    borderWidth: 1, borderColor: '#fab1a0', elevation: 2,
  },
  alertText: {
    fontSize: 13, color: '#d63031', fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: '#d63031',
    paddingVertical: 16, borderRadius: 16,
    alignItems: 'center', width: '100%', maxWidth: 360,
    elevation: 4,
    shadowColor: '#d63031', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  resetBtnText: {
    color: '#ffffff', fontSize: 16, fontWeight: '900',
  },
  sidebar: {
    position: 'absolute', right: 12, top: 28, bottom: 28, width: 62,
  },
  sidebarScroll: {
    alignItems: 'center', paddingVertical: 8, gap: 14,
  },
  sidebarItem: {
    width: 56, height: 56, backgroundColor: '#ffffff',
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    elevation: 6, borderWidth: 2, borderColor: 'rgba(9,132,227,0.25)',
    shadowColor: '#0984e3', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8,
  },
  sidebarEmoji: { fontSize: 26 },
  badge: {
    position: 'absolute', top: -4, right: -4,
    backgroundColor: '#d63031', borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#ffffff', paddingHorizontal: 4,
  },
  badgeText: { color: '#ffffff', fontSize: 10, fontWeight: '900' },
});

export default HomeScreen;
