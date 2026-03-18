import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TamagotchiContext, ACHIEVEMENTS } from '../context/TamagotchiContext';

const DIFFICULTY_CFG = {
  'Kolay':    { color: '#00b894', bg: 'rgba(0,184,148,0.12)',   dot: '#00b894' },
  'Orta':     { color: '#fdcb6e', bg: 'rgba(253,203,110,0.14)', dot: '#fdcb6e' },
  'Zor':      { color: '#e17055', bg: 'rgba(225,112,85,0.12)',  dot: '#e17055' },
  'Efsanevi': { color: '#a29bfe', bg: 'rgba(108,92,231,0.14)', dot: '#6c5ce7' },
};

const ProfileScreen = () => {
  const { isim, tur, level, xp, rozetler, oduluAlinanRozetler, basarimOduluAl,
          istatistikler, altin, mutluluk, isDarkMode, getGerekenXp } = useContext(TamagotchiContext);

  const bg      = isDarkMode ? '#0d0d0d' : '#f0f4ff';
  const cardBg  = isDarkMode ? '#1a1a2e' : '#ffffff';
  const txtC    = isDarkMode ? '#f1f2f6' : '#2d3436';
  const subC    = isDarkMode ? '#b2bec3' : '#636e72';

  const gerekenXp  = getGerekenXp ? getGerekenXp(level) : 100;
  const xpYuzde    = Math.min(100, (xp / gerekenXp) * 100);

  const unlockedCount = rozetler.length;
  const totalCount    = ACHIEVEMENTS.length;

  const getIlerleme = (ach) => {
    let mevcut = 0, max = 1;
    switch(ach.id) {
      case 'ilk_isirik':       mevcut = istatistikler.beslenmeSayisi;       max = 1;    break;
      case 'obur':             mevcut = istatistikler.beslenmeSayisi;       max = 10;   break;
      case 'oyuncu':           mevcut = istatistikler.oynamaSayisi;         max = 10;   break;
      case 'odak_ustasi':      mevcut = istatistikler.odakTamamlanmaSayisi; max = 5;    break;
      case 'dahi':             mevcut = istatistikler.odakTamamlanmaSayisi; max = 15;   break;
      case 'hayvan_sever':     mevcut = istatistikler.oynamaSayisi;         max = 50;   break;
      case 'zengin_bakici':    mevcut = altin;                              max = 500;  break;
      case 'milyoner':         mevcut = altin;                              max = 1000; break;
      case 'mukemmel_denge':   mevcut = level;                              max = 10;   break;
      case 'mutlu_dost':       mevcut = mutluluk;                           max = 100;  break;
      case 'usta_bakici':      mevcut = level;                              max = 3;    break;
      case 'efsanevi_egitmen': mevcut = level;                              max = 5;    break;
      case 'alisveriskolik':   mevcut = istatistikler.harcananAltin || 0;   max = 500;  break;
      case 'arcade_ustasi':    mevcut = istatistikler.oynamaSayisi;         max = 20;   break;
      case 'evrim_uzmani':     mevcut = level;                              max = 15;   break;
    }
    const yuzde = Math.min(100, Math.max(0, (mevcut / max) * 100));
    return { yuzde, mevcut: Math.floor(Math.min(mevcut, max)), max };
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {/* Dekor */}
      <View style={[styles.dekorCircle, isDarkMode && { backgroundColor: 'rgba(108,92,231,0.07)' }]} />

      {/* Profil kartı */}
      <View style={[styles.profileCard, { backgroundColor: cardBg }, isDarkMode && styles.profileCardDark]}>
        <View style={styles.avatarBg}>
          <Text style={styles.avatarEmoji}>🏆</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.petName, { color: txtC }]}>{isim}</Text>
          <Text style={[styles.turLabel, { color: subC }]}>{tur}</Text>
        </View>
        <View style={styles.statChips}>
          <View style={[styles.chip, { backgroundColor: 'rgba(9,132,227,0.12)', borderColor: '#0984e3' }]}>
            <Text style={[styles.chipTxt, { color: '#0984e3' }]}>Lv {level}</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: 'rgba(108,92,231,0.12)', borderColor: '#6c5ce7' }]}>
            <Text style={[styles.chipTxt, { color: '#6c5ce7' }]}>{xp} XP</Text>
          </View>
          <View style={[styles.chip, { backgroundColor: 'rgba(243,156,18,0.12)', borderColor: '#f39c12' }]}>
            <Text style={[styles.chipTxt, { color: '#f39c12' }]}>💰 {altin}</Text>
          </View>
        </View>
        {/* XP bar */}
        <View style={styles.xpRow}>
          <View style={[styles.xpBarBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
            <View style={[styles.xpBarFill, { width: `${xpYuzde}%` }]} />
          </View>
          <Text style={[styles.xpTxt, { color: subC }]}>{xp}/{gerekenXp}</Text>
        </View>
      </View>

      {/* Başarım sayacı */}
      <View style={styles.counterRow}>
        <Text style={[styles.counterTxt, { color: subC }]}>
          Tüm Görevler
        </Text>
        <View style={[styles.counterBadge, isDarkMode && { backgroundColor: 'rgba(108,92,231,0.2)' }]}>
          <Text style={styles.counterBadgeTxt}>{unlockedCount}/{totalCount}</Text>
        </View>
      </View>

      {/* Başarım listesi */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {ACHIEVEMENTS.map(ach => {
          const acikMi      = rozetler.includes(ach.id);
          const odulAlindiMi = oduluAlinanRozetler.includes(ach.id);
          const claimable   = acikMi && !odulAlindiMi;
          const ilerleme    = getIlerleme(ach);
          const difCfg      = DIFFICULTY_CFG[ach.zorluk] || DIFFICULTY_CFG['Kolay'];

          return (
            <TouchableOpacity
              key={ach.id}
              style={[
                styles.achCard,
                { backgroundColor: cardBg },
                isDarkMode && styles.achCardDark,
                !acikMi && styles.achCardLocked,
                isDarkMode && !acikMi && { opacity: 0.55 },
                claimable && [styles.achCardClaimable, isDarkMode && { backgroundColor: '#0d2219', borderColor: '#00b894' }],
              ]}
              onPress={() => claimable ? basarimOduluAl(ach.id) : null}
              activeOpacity={claimable ? 0.75 : 1}
            >
              {/* Emoji kutusu */}
              <View style={[
                styles.emojiBox,
                { backgroundColor: acikMi ? difCfg.bg : 'rgba(0,0,0,0.04)', borderColor: acikMi ? difCfg.color + '55' : 'transparent' },
              ]}>
                <Text style={styles.achEmoji}>{acikMi ? ach.emoji : '🔒'}</Text>
              </View>

              <View style={styles.achBody}>
                <Text style={[styles.achTitle, { color: !acikMi ? subC : txtC }]}>{ach.isim}</Text>
                <Text style={[styles.achDesc, { color: subC }]}>{ach.aciklama}</Text>

                {/* Ödül satırı */}
                <View style={styles.rewardRow}>
                  <View style={[styles.rewardChip, { backgroundColor: 'rgba(108,92,231,0.1)', borderColor: '#a29bfe' }]}>
                    <Text style={[styles.rewardTxt, { color: '#6c5ce7' }]}>+{ach.xpOdul} XP</Text>
                  </View>
                  <View style={[styles.rewardChip, { backgroundColor: 'rgba(243,156,18,0.1)', borderColor: '#fdcb6e' }]}>
                    <Text style={[styles.rewardTxt, { color: '#e67e22' }]}>+{ach.altinOdul} 💰</Text>
                  </View>
                </View>

                {/* İlerleme barı (kilitli) */}
                {!acikMi && (
                  <View style={styles.progressGroup}>
                    <View style={[styles.progressBg, isDarkMode && { backgroundColor: '#2d3436' }]}>
                      <View style={[styles.progressFill, { width: `${ilerleme.yuzde}%`, backgroundColor: difCfg.color }]} />
                    </View>
                    <Text style={[styles.progressTxt, { color: subC }]}>
                      {ilerleme.mevcut}/{ilerleme.max}
                    </Text>
                  </View>
                )}
              </View>

              {/* Sağ durum */}
              <View style={styles.statusCol}>
                {/* Zorluk dot */}
                <View style={[styles.difDot, { backgroundColor: difCfg.dot }]} />
                <Text style={[styles.difTxt, { color: difCfg.color }]}>{ach.zorluk}</Text>

                {odulAlindiMi && <Text style={styles.doneTag}>✅</Text>}
                {claimable && (
                  <View style={styles.claimBtn}>
                    <Text style={styles.claimBtnTxt}>Al!</Text>
                  </View>
                )}
                {!acikMi && <Text style={[styles.lockedTxt, { color: subC }]}>🔒</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 50 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container:   { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  dekorCircle: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(9,132,227,0.05)', top: -80, right: -80,
  },
  profileCard: {
    borderRadius: 24, padding: 20, marginBottom: 16,
    elevation: 8,
    shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 16,
    borderWidth: 1, borderColor: 'rgba(108,92,231,0.12)',
  },
  profileCardDark: {
    borderColor: 'rgba(108,92,231,0.3)', shadowOpacity: 0.35,
  },
  avatarBg: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(108,92,231,0.12)', alignItems: 'center', justifyContent: 'center',
    marginBottom: 10, alignSelf: 'center', borderWidth: 2, borderColor: '#a29bfe',
  },
  avatarEmoji: { fontSize: 30 },
  profileInfo: { alignItems: 'center', marginBottom: 12 },
  petName:     { fontSize: 22, fontWeight: '900' },
  turLabel:    { fontSize: 14, fontWeight: '600', marginTop: 2 },
  statChips:   { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 12 },
  chip:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  chipTxt:     { fontSize: 13, fontWeight: '800' },
  xpRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  xpBarBg:     { flex: 1, height: 8, backgroundColor: '#e0e7ff', borderRadius: 4, overflow: 'hidden' },
  xpBarFill:   { height: '100%', backgroundColor: '#6c5ce7', borderRadius: 4 },
  xpTxt:       { fontSize: 11, fontWeight: '700', minWidth: 55, textAlign: 'right' },
  counterRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  counterTxt:  { fontSize: 15, fontWeight: '700' },
  counterBadge: {
    backgroundColor: 'rgba(108,92,231,0.12)', paddingHorizontal: 12,
    paddingVertical: 4, borderRadius: 12,
  },
  counterBadgeTxt: { color: '#6c5ce7', fontWeight: '900', fontSize: 13 },
  scroll: { flex: 1 },
  achCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 18, padding: 14, marginBottom: 10,
    elevation: 3, shadowColor: '#6c5ce7', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10,
    borderWidth: 1.5, borderColor: 'rgba(108,92,231,0.1)',
  },
  achCardDark:     { borderColor: 'rgba(108,92,231,0.25)' },
  achCardLocked:   { borderColor: 'rgba(0,0,0,0.06)', elevation: 1 },
  achCardClaimable: {
    borderColor: '#00b894', borderWidth: 2,
    shadowColor: '#00b894', shadowOpacity: 0.25, elevation: 6,
  },
  emojiBox: {
    width: 50, height: 50, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, marginRight: 12,
  },
  achEmoji: { fontSize: 26 },
  achBody:  { flex: 1, marginRight: 8 },
  achTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  achDesc:  { fontSize: 11, lineHeight: 15, marginBottom: 6 },
  rewardRow: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  rewardChip: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1,
  },
  rewardTxt: { fontSize: 11, fontWeight: '800' },
  progressGroup: { gap: 3 },
  progressBg: {
    height: 6, backgroundColor: '#e0e7ff', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  progressTxt:  { fontSize: 10, fontWeight: '700', textAlign: 'right' },
  statusCol: { alignItems: 'center', minWidth: 50, gap: 4 },
  difDot: { width: 8, height: 8, borderRadius: 4 },
  difTxt: { fontSize: 10, fontWeight: '800' },
  doneTag: { fontSize: 18 },
  claimBtn: {
    backgroundColor: '#00b894', paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 10, marginTop: 2,
    elevation: 3, shadowColor: '#00b894', shadowOpacity: 0.3, shadowRadius: 4,
  },
  claimBtnTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },
  lockedTxt:   { fontSize: 16 },
});

export default ProfileScreen;
