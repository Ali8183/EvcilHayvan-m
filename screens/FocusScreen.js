import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { TamagotchiContext } from '../context/TamagotchiContext';

const FocusScreen = () => {
  const { tamamlaOdak, bozOdak, isDarkMode } = useContext(TamagotchiContext);

  const SURELER = [1, 3, 5];
  const [seciliSure, setSeciliSure]     = useState(3);
  const [kalanSaniye, setKalanSaniye]   = useState(3 * 60);
  const [aktif, setAktif]               = useState(false);

  // Animation values
  const pulseAnim   = React.useRef(new Animated.Value(1)).current;
  const glowAnim    = React.useRef(new Animated.Value(0.4)).current;
  const arcAnim     = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let interval = null;
    if (aktif && kalanSaniye > 0) {
      interval = setInterval(() => setKalanSaniye(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [aktif, kalanSaniye]);

  useEffect(() => {
    if (kalanSaniye <= 0 && aktif) {
      setAktif(false);
      tamamlaOdak(seciliSure);
      setKalanSaniye(seciliSure * 60);
    }
  }, [kalanSaniye, aktif, seciliSure, tamamlaOdak]);

  // pulse animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    if (aktif) loop.start();
    else loop.stop();
    return () => loop.stop();
  }, [aktif]);

  // glow
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1600, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.3, duration: 1600, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // arc fill
  useEffect(() => {
    const totalSaniye = seciliSure * 60;
    const ilerleme = 1 - (kalanSaniye / totalSaniye);
    Animated.timing(arcAnim, { toValue: ilerleme, duration: 400, useNativeDriver: false }).start();
  }, [kalanSaniye, seciliSure]);

  const sureSec = (dk) => {
    if (aktif) return;
    setSeciliSure(dk);
    setKalanSaniye(dk * 60);
  };

  const formatSaniye = (s) => {
    const d = Math.floor(s / 60), sn = s % 60;
    return `${d < 10 ? '0' : ''}${d}:${sn < 10 ? '0' : ''}${sn}`;
  };

  const bg     = isDarkMode ? '#0d0d0d' : '#f0f4ff';
  const cardBg = isDarkMode ? '#1a1a2e' : '#ffffff';
  const txtC   = isDarkMode ? '#f1f2f6' : '#2d3436';
  const subC   = isDarkMode ? '#b2bec3' : '#636e72';

  const totalSaniye  = seciliSure * 60;
  const progressYuzde = 1 - kalanSaniye / totalSaniye;
  const arcColor = aktif ? '#0984e3' : (isDarkMode ? '#6c5ce7' : '#a29bfe');

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Dekoratif arka plan */}
      <View style={[styles.bgCircle, isDarkMode && { backgroundColor: 'rgba(9,132,227,0.07)' }]} />

      <Text style={[styles.title, { color: txtC }]}>Odaklanma Modu 🎯</Text>
      <Text style={[styles.desc,  { color: subC }]}>
        Süreyi bozmadan bitirirsen XP ve 💰 kazanırsın!
      </Text>

      {/* Süre seçimi */}
      <View style={styles.optionsRow}>
        {SURELER.map(dk => (
          <TouchableOpacity
            key={dk}
            style={[
              styles.optionBtn,
              { backgroundColor: cardBg, borderColor: 'rgba(108,92,231,0.2)' },
              seciliSure === dk && styles.optionBtnActive,
              isDarkMode && { backgroundColor: '#1e1e2e', borderColor: 'rgba(108,92,231,0.35)' },
              aktif && { opacity: 0.45 },
            ]}
            onPress={() => sureSec(dk)}
            disabled={aktif}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionTxt, seciliSure === dk && styles.optionTxtActive]}>
              {dk} Dk
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Timer dairesi */}
      <Animated.View style={[
        styles.timerCircle,
        { borderColor: arcColor, backgroundColor: cardBg, transform: [{ scale: pulseAnim }] },
        isDarkMode && styles.timerCircleDark,
      ]}>
        {/* İç glow ring */}
        <Animated.View style={[
          styles.innerGlow,
          { opacity: glowAnim, borderColor: arcColor },
        ]} />

        {/* İlerleme bar (ince üst şerit) */}
        <View style={[styles.progressArc, { backgroundColor: isDarkMode ? '#1e1e2e' : '#e0e7ff' }]}>
          <View style={[styles.progressFill, { width: `${progressYuzde * 100}%`, backgroundColor: arcColor }]} />
        </View>

        <Text style={[styles.timerText, { color: txtC }]}>{formatSaniye(kalanSaniye)}</Text>
        <Text style={[styles.timerStatus, { color: subC }]}>
          {aktif ? '⚡ Odaklanıyorsun...' : '✋ Hazır!'}
        </Text>
      </Animated.View>

      {!aktif ? (
        <TouchableOpacity style={styles.startBtn} onPress={() => { if (kalanSaniye > 0) setAktif(true); }} activeOpacity={0.85}>
          <Text style={styles.startBtnTxt}>▶  Başla</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.giveUpBtn} onPress={() => { setAktif(false); setKalanSaniye(seciliSure * 60); bozOdak(); }} activeOpacity={0.85}>
          <Text style={styles.giveUpBtnTxt}>✕  Pes Et (Cezalı)</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 36,
  },
  bgCircle: {
    position: 'absolute', width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(9,132,227,0.05)', top: -90, right: -100,
  },
  title: {
    fontSize: 26, fontWeight: '900', marginBottom: 8,
  },
  desc: {
    fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 28, paddingHorizontal: 10, fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row', gap: 14, marginBottom: 36,
  },
  optionBtn: {
    paddingVertical: 12, paddingHorizontal: 22, borderRadius: 18, borderWidth: 1.5,
    elevation: 2, shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6,
  },
  optionBtnActive: {
    backgroundColor: '#6c5ce7', borderColor: '#6c5ce7',
    shadowOpacity: 0.35, elevation: 5,
  },
  optionTxt:       { fontSize: 15, color: '#636e72', fontWeight: '700' },
  optionTxtActive: { color: '#ffffff' },
  timerCircle: {
    width: 250, height: 250, borderRadius: 125,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 38,
    elevation: 14,
    shadowColor: '#0984e3', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 28,
    borderWidth: 5,
    overflow: 'hidden',
  },
  timerCircleDark: {
    shadowOpacity: 0.55, borderColor: '#6c5ce7', shadowColor: '#6c5ce7',
  },
  innerGlow: {
    position: 'absolute', width: 210, height: 210, borderRadius: 105,
    borderWidth: 1.5,
  },
  progressArc: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 6, borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
  },
  timerText:   { fontSize: 56, fontWeight: '900', letterSpacing: 2 },
  timerStatus: { fontSize: 14, marginTop: 6, fontWeight: '700' },
  startBtn: {
    backgroundColor: '#00b894', width: '100%', paddingVertical: 18, borderRadius: 18,
    alignItems: 'center', elevation: 6,
    shadowColor: '#00b894', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  startBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  giveUpBtn: {
    backgroundColor: '#d63031', width: '100%', paddingVertical: 18, borderRadius: 18,
    alignItems: 'center', elevation: 6,
    shadowColor: '#d63031', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12,
  },
  giveUpBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900' },
});

export default FocusScreen;
