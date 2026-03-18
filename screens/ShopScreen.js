import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { TamagotchiContext, MARKET_ITEMS } from '../context/TamagotchiContext';

const SECTION_CFG = {
  yiyecek: { color: '#00b894', bg: 'rgba(0,184,148,0.1)',   icon: '🍽', label: 'Yiyecekler',   btnColor: '#00b894' },
  icecek:  { color: '#0984e3', bg: 'rgba(9,132,227,0.1)',   icon: '🥤', label: 'İçecekler',     btnColor: '#0984e3' },
  ozel:    { color: '#6c5ce7', bg: 'rgba(108,92,231,0.1)',  icon: '✨', label: 'Özel Öğeler',   btnColor: '#6c5ce7' },
};

// Etkiyi kullanıcıya anlaşılır formatta hazırla
const buildEffects = (item) => {
  const effects = [];

  // Açlık (negatif = doyurur, pozitif = acıktırır)
  if (item.aclikEtkisi < 0) {
    effects.push({ icon: '🍽', label: 'Doyurur', value: `%${Math.abs(item.aclikEtkisi)}`, color: '#00b894', positive: true });
  } else if (item.aclikEtkisi > 0) {
    effects.push({ icon: '🍽', label: 'Acıktırır', value: `+%${item.aclikEtkisi}`, color: '#e17055', positive: false });
  }

  // Mutluluk
  if (item.mutlulukEtkisi > 0) {
    effects.push({ icon: '😊', label: 'Mutluluk', value: `+%${item.mutlulukEtkisi}`, color: '#fdcb6e', positive: true });
  }

  // XP — sayı olarak göster
  if (item.xpEtkisi > 0) {
    effects.push({ icon: '⭐', label: 'XP', value: `+${item.xpEtkisi}`, color: '#a29bfe', positive: true });
  }

  // Özel özellik: iyileştirme
  const iyilestirici = ['ilac', 'sihirliIksir', 'mucizeIksiri'];
  if (iyilestirici.includes(item.id)) {
    effects.push({ icon: '💊', label: 'İyileştirir', value: '✅', color: '#ff7675', positive: true });
  }

  return effects;
};

const ShopScreen = () => {
  const { esyaSatinAl, isDarkMode } = useContext(TamagotchiContext);

  const bg      = isDarkMode ? '#0d0d0d' : '#f0f4ff';
  const cardBg  = isDarkMode ? '#1a1a2e' : '#ffffff';
  const txtC    = isDarkMode ? '#f1f2f6' : '#2d3436';
  const subC    = isDarkMode ? '#b2bec3' : '#636e72';

  const sections = ['yiyecek', 'icecek', 'ozel'];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bg }]}
      contentContainerStyle={{ paddingBottom: 50 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.decorCircle, isDarkMode && { backgroundColor: 'rgba(108,92,231,0.07)' }]} />

      <Text style={[styles.introText, { color: subC }]}>
        Evcil hayvanını mutlu ve sağlıklı tutmak için alışveriş yap!
      </Text>

      {sections.map(tip => {
        const items = Object.values(MARKET_ITEMS).filter(i => i.tip === tip);
        const sec   = SECTION_CFG[tip];

        return (
          <View
            key={tip}
            style={[
              styles.section,
              { borderLeftColor: sec.color },
              isDarkMode && { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: sec.color + '40' },
            ]}
          >
            {/* Bölüm başlığı */}
            <View style={[styles.sectionHeader, { backgroundColor: sec.bg }]}>
              <Text style={[styles.sectionIcon]}>{sec.icon}</Text>
              <Text style={[styles.sectionTitle, { color: sec.color }]}>{sec.label}</Text>
              <View style={[styles.itemCountBadge, { backgroundColor: sec.color + '22', borderColor: sec.color + '55' }]}>
                <Text style={[styles.itemCountTxt, { color: sec.color }]}>{items.length} ürün</Text>
              </View>
            </View>

            {items.map(item => {
              const effects = buildEffects(item);
              return (
                <View
                  key={item.id}
                  style={[
                    styles.itemCard,
                    { backgroundColor: cardBg },
                    isDarkMode && { borderTopColor: 'rgba(255,255,255,0.04)' },
                  ]}
                >
                  {/* Sol: emoji kutusu */}
                  <View style={[styles.emojiBox, { backgroundColor: sec.bg, borderColor: sec.color + '44' }]}>
                    <Text style={styles.itemEmoji}>{item.emoji}</Text>
                  </View>

                  {/* Orta: bilgi */}
                  <View style={styles.itemBody}>
                    <Text style={[styles.itemTitle, { color: txtC }]}>{item.isim}</Text>
                    <Text style={[styles.itemDesc, { color: subC }]}>{item.aciklama}</Text>

                    {/* Etki etiketleri */}
                    <View style={styles.effectsRow}>
                      {effects.map((ef, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.effectChip,
                            { backgroundColor: ef.color + '18', borderColor: ef.color + '55' },
                          ]}
                        >
                          <Text style={styles.effectIcon}>{ef.icon}</Text>
                          <Text style={[styles.effectValue, { color: ef.color }]}>{ef.value}</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Sağ: fiyat + al butonu */}
                  <TouchableOpacity
                    style={[styles.buyButton, { backgroundColor: sec.btnColor }]}
                    onPress={() => esyaSatinAl(item.id)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.buyPrice}>{item.fiyat}</Text>
                    <Text style={styles.buyIcon}>💰</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, paddingHorizontal: 14, paddingTop: 16,
  },
  decorCircle: {
    position: 'absolute', width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(0,184,148,0.05)', top: -60, right: -80,
  },
  introText: {
    fontSize: 13, marginBottom: 18, fontWeight: '600', textAlign: 'center',
  },
  section: {
    marginBottom: 20, borderRadius: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)', borderLeftWidth: 4,
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, gap: 8,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '900', flex: 1 },
  itemCountBadge: {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1,
  },
  itemCountTxt: { fontSize: 10, fontWeight: '800' },
  itemCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)',
  },
  emojiBox: {
    width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, marginRight: 12, flexShrink: 0,
  },
  itemEmoji: { fontSize: 26 },
  itemBody:  { flex: 1, marginRight: 10 },
  itemTitle: { fontSize: 14, fontWeight: '900', marginBottom: 2 },
  itemDesc:  { fontSize: 11, lineHeight: 15, marginBottom: 8 },
  effectsRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 5,
  },
  effectChip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 7, paddingVertical: 3,
    borderRadius: 8, borderWidth: 1,
  },
  effectIcon:  { fontSize: 11 },
  effectValue: { fontSize: 11, fontWeight: '800' },
  buyButton: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14,
    elevation: 4,
    shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6,
    flexShrink: 0,
  },
  buyPrice: { color: '#fff', fontWeight: '900', fontSize: 14 },
  buyIcon:  { fontSize: 13 },
});

export default ShopScreen;
